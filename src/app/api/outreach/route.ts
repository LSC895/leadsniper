import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const startTime = Date.now();
  let emailsSent = 0;

  try {
    // 1. Get configuration
    const { data: configData } = await supabase.from('config').select('*');
    const config: Record<string, string> = {};
    configData?.forEach(c => config[c.key] = c.value);

    const dailyLimit = parseInt(config['daily_send_limit'] || '20');
    const pipelinePaused = config['pipeline_paused'] === 'true';

    if (pipelinePaused) {
      return NextResponse.json({ success: true, message: 'Pipeline is paused' });
    }

    // 2. Count emails sent today
    const today = new Date().toISOString().split('T')[0];
    const { count: sentTodayCount, error: countError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .filter('sent_at', 'gte', `${today}T00:00:00Z`)
      .filter('outreach_status', 'eq', 'sent');

    if (countError) throw countError;

    const remainingQuota = dailyLimit - (sentTodayCount || 0);
    if (remainingQuota <= 0) {
      return NextResponse.json({ success: true, message: 'Daily limit reached', emailsSent: 0 });
    }

    // 3. Fetch leads to reach out to
    const { data: leads, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('outreach_status', 'pending')
      .gte('ai_score', 7)
      .limit(remainingQuota);

    if (fetchError) throw fetchError;
    if (!leads || leads.length === 0) {
      return NextResponse.json({ success: true, message: 'No leads pending outreach', emailsSent: 0 });
    }

    // 4. Setup Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    for (const lead of leads) {
      if (lead.source.includes('Reddit') || !lead.contact_email) {
        // Reddit leads or leads without email need manual DM
        await supabase.from('leads').update({
          outreach_status: 'needs_manual_dm',
          outreach_channel: 'reddit_dm'
        }).eq('id', lead.id);
        continue;
      }

      try {
        await transporter.sendMail({
          from: process.env.GMAIL_ADDRESS,
          to: lead.contact_email,
          subject: lead.subject_line,
          text: lead.message_sent,
        });

        await supabase.from('leads').update({
          outreach_status: 'sent',
          outreach_channel: 'email',
          sent_at: new Date().toISOString()
        }).eq('id', lead.id);

        emailsSent++;
      } catch (err: any) {
        console.error(`Failed to send email to ${lead.contact_email}:`, err.message);
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      duration: Date.now() - startTime,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  // Optional: Check for Vercel Cron header or secret key
  const authHeader = request.headers.get('authorization');
  if (process.env.VERCEL_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const startTime = Date.now();
  let totalScraped = 0;
  let totalQualified = 0;
  let totalSent = 0;
  const errors: string[] = [];

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 1. Scrape
    const scrapeRes = await fetch(`${baseUrl}/api/scrape`);
    const scrapeData = await scrapeRes.json();
    totalScraped = scrapeData.leadsScraped || 0;
    if (scrapeData.errors) errors.push(...scrapeData.errors);

    // 2. Filter
    const filterRes = await fetch(`${baseUrl}/api/filter`);
    const filterData = await filterRes.json();
    totalQualified = filterData.leadsQualified || 0;

    // 3. Outreach
    const outreachRes = await fetch(`${baseUrl}/api/outreach`);
    const outreachData = await outreachRes.json();
    totalSent = outreachData.emailsSent || 0;

    // Log the run
    await supabase.from('pipeline_runs').insert({
      run_at: new Date().toISOString(),
      leads_scraped: totalScraped,
      leads_qualified: totalQualified,
      emails_sent: totalSent,
      errors: errors.length > 0 ? JSON.stringify(errors) : null,
      duration_ms: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
      summary: {
        scraped: totalScraped,
        qualified: totalQualified,
        sent: totalSent,
      },
      duration: Date.now() - startTime,
    });
  } catch (error: any) {
    // Log failed run
    await supabase.from('pipeline_runs').insert({
      run_at: new Date().toISOString(),
      errors: error.message,
      duration_ms: Date.now() - startTime,
    });

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

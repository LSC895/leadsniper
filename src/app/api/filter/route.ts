import { NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const PROFILE = `
Name: Lucky Singh, AI Solutions Specialist
Skills: LLM apps, RAG, FastAPI, Supabase, ChromaDB, Docker, Python
Projects: 
- RoastmyCV: AI resume tailor
- Astraeus: AI fitness assistant
- Tatav: Cognitive architecture with persistent memory
- CHETNA: Self-learning AI agent
Offer: POC to production in 1-2 weeks, clear communication with founders
`;

export async function GET() {
  const startTime = Date.now();
  let leadsQualified = 0;

  try {
    // 1. Fetch leads that haven't been scored yet
    const { data: leads, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .is('ai_score', null)
      .limit(10); // Process in batches to avoid timeouts

    if (fetchError) throw fetchError;
    if (!leads || leads.length === 0) {
      return NextResponse.json({ success: true, message: 'No new leads to score', leadsQualified: 0 });
    }

    for (const lead of leads) {
      try {
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20240620', // Using current available sonnet model
          max_tokens: 1000,
          system: `You are an AI lead filtering assistant. Evaluate if this job post or Reddit post is a good fit for the developer profile provided.
          Return ONLY a valid JSON object with these keys: 
          { 
            "score": number (1-10), 
            "reason": string, 
            "pain_point": string, 
            "fit": boolean, 
            "subject_line": string, 
            "message": string (80-100 words casual outreach) 
          }`,
          messages: [
            {
              role: 'user',
              content: `
Developer Profile:
${PROFILE}

Lead Title: ${lead.title}
Lead Description: ${lead.description}

Evaluate this lead. If the score is >= 7, generate a personalized subject line and casual outreach message.
`
            }
          ],
        });

        // Parse JSON from Claude response
        const content = response.content[0].type === 'text' ? response.content[0].text : '';
        const result = JSON.parse(content);

        // Update lead in DB
        await supabase.from('leads').update({
          ai_score: result.score,
          ai_reason: result.reason,
          pain_point: result.pain_point,
          subject_line: result.subject_line,
          message_sent: result.message,
          outreach_status: result.score >= 7 ? 'pending' : 'ignored',
        }).eq('id', lead.id);

        if (result.score >= 7) leadsQualified++;
      } catch (err: any) {
        console.error(`Error scoring lead ${lead.id}:`, err.message);
      }
    }

    return NextResponse.json({
      success: true,
      leadsQualified,
      duration: Date.now() - startTime,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

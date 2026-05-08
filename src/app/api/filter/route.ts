import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServiceSupabase } from '@/lib/supabase';

const supabase = getServiceSupabase();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  generationConfig: {
    responseMimeType: "application/json",
  }
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
        const prompt = `
        You are an AI lead filtering assistant. Evaluate if this job post or Reddit post is a good fit for the developer profile provided.
        
        Developer Profile:
        ${PROFILE}
        
        Lead Title: ${lead.title}
        Lead Description: ${lead.description}
        
        Evaluate this lead. If the score is >= 7, generate a personalized subject line and casual outreach message.
        
        Return ONLY a valid JSON object with these keys: 
        { 
          "score": number (1-10), 
          "reason": string, 
          "pain_point": string, 
          "fit": boolean, 
          "subject_line": string, 
          "message": string (80-100 words casual outreach) 
        }`;

        const resultResponse = await model.generateContent(prompt);
        const responseText = resultResponse.response.text();
        
        // Gemini with JSON mode should return clean JSON, but let's be safe
        let result;
        try {
          result = JSON.parse(responseText.replace(/```json\n?|\n?```/g, '').trim());
        } catch (e) {
          console.error("Failed to parse Gemini response as JSON:", responseText);
          continue;
        }

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

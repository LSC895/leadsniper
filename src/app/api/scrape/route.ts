import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import axios from 'axios';
import crypto from 'crypto';
import { getServiceSupabase } from '@/lib/supabase';

const supabase = getServiceSupabase();

const parser = new Parser();

const UPWORK_FEEDS = [
  'https://www.upwork.com/ab/feed/jobs/rss?q=AI+automation&sort=recency',
  'https://www.upwork.com/ab/feed/jobs/rss?q=LLM+python&sort=recency',
  'https://www.upwork.com/ab/feed/jobs/rss?q=RAG+chatbot&sort=recency',
];

const REDDIT_SUBS = ['entrepreneur', 'startups', 'SaaS', 'smallbusiness'];
const REDDIT_USER_AGENT = 'LeadSniper/1.0 (personal-tool)';

export async function GET() {
  const startTime = Date.now();
  let leadsScraped = 0;
  const errors: string[] = [];

  try {
    // 1. Scrape Upwork
    for (const feedUrl of UPWORK_FEEDS) {
      try {
        const feed = await parser.parseURL(feedUrl);
        for (const item of feed.items) {
          const leadId = crypto.createHash('md5').update(item.link!).digest('hex');
          
          const { error } = await supabase.from('leads').upsert({
            lead_id: leadId,
            source: 'Upwork',
            title: item.title || 'No Title',
            url: item.link!,
            description: item.contentSnippet || item.content || '',
            scraped_at: new Date().toISOString(),
          }, { onConflict: 'lead_id' });

          if (!error) leadsScraped++;
        }
      } catch (err: any) {
        errors.push(`Upwork Scrape Error (${feedUrl}): ${err.message}`);
      }
    }

    // 2. Scrape Reddit
    for (const sub of REDDIT_SUBS) {
      try {
        const response = await axios.get(`https://www.reddit.com/r/${sub}/new.json?limit=25`, {
          headers: { 'User-Agent': REDDIT_USER_AGENT },
        });

        const posts = response.data.data.children;
        for (const post of posts) {
          const data = post.data;
          const url = `https://www.reddit.com${data.permalink}`;
          const leadId = crypto.createHash('md5').update(url).digest('hex');

          const { error } = await supabase.from('leads').upsert({
            lead_id: leadId,
            source: `Reddit (r/${sub})`,
            title: data.title,
            url: url,
            description: data.selftext || '',
            scraped_at: new Date().toISOString(),
          }, { onConflict: 'lead_id' });

          if (!error) leadsScraped++;
        }
      } catch (err: any) {
        errors.push(`Reddit Scrape Error (r/${sub}): ${err.message}`);
      }
    }

    // Log the run (we'll update this with more details in the orchestrator)
    return NextResponse.json({
      success: true,
      leadsScraped,
      errors: errors.length > 0 ? errors : null,
      duration: Date.now() - startTime,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

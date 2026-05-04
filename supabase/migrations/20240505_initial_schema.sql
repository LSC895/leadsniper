-- Table: leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id TEXT UNIQUE NOT NULL, -- unique identifier (MD5 of URL)
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  contact_name TEXT,
  contact_email TEXT,
  ai_score INTEGER,
  ai_reason TEXT,
  pain_point TEXT,
  subject_line TEXT,
  message_sent TEXT,
  outreach_status TEXT DEFAULT 'pending', -- pending, sent, needs_manual_dm, ignored
  outreach_channel TEXT, -- email, reddit_dm
  sent_at TIMESTAMPTZ,
  reply_received BOOLEAN DEFAULT FALSE,
  meeting_booked BOOLEAN DEFAULT FALSE,
  contract_signed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: pipeline_runs
CREATE TABLE IF NOT EXISTS pipeline_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ DEFAULT NOW(),
  leads_scraped INTEGER DEFAULT 0,
  leads_qualified INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  errors TEXT,
  duration_ms INTEGER
);

-- Table: config
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Initial Config
INSERT INTO config (key, value) VALUES 
('daily_send_limit', '20'),
('pipeline_paused', 'false'),
('keywords', 'AI automation, LLM python, RAG chatbot')
ON CONFLICT (key) DO NOTHING;

# LeadSniper 🎯

**LeadSniper** is an autonomous, AI-powered lead generation and outreach machine. It hunts for high-ticket freelance opportunities across Upwork and Reddit, qualifies them using Google Gemini 1.5 Flash, and handles personalized outreach—all on autopilot.

---

## 🚀 Features

-   **Multi-Platform Scraping**: Automatically monitors Upwork RSS feeds and Reddit subreddits (r/entrepreneur, r/SaaS, etc.) for specific keywords.
-   **AI-Powered Qualification**: Uses **Google Gemini 1.5 Flash** to score leads (1-10) based on your developer profile and technical fit.
-   **Intelligent Outreach**: Automatically crafts hyper-personalized subject lines and emails for high-scoring leads.
-   **Automated Pipeline**: Powered by Vercel Cron Jobs to run discovery, filtering, and outreach every 4 hours.
-   **Modern Dashboard**: A sleek, dark-themed UI to monitor stats, recent leads, and meeting bookings.

---

## 🛠️ Tech Stack

-   **Frontend**: Next.js 14 (App Router), Tailwind CSS, Shadcn UI.
-   **Backend**: Next.js API Routes (Edge compatible).
-   **Database**: Supabase (PostgreSQL) for lead storage and configuration.
-   **AI Engine**: Google Gemini 1.5 Flash.
-   **Outreach**: Nodemailer (via Gmail SMTP).
-   **Scheduling**: Vercel Cron Jobs.

---

## 🏗️ Architecture

1.  **Scrape (`/api/scrape`)**: Fetches new job posts and threads.
2.  **Filter (`/api/filter`)**: Gemini evaluates descriptions, identifies pain points, and drafts messages.
3.  **Outreach (`/api/outreach`)**: Sends emails to qualified leads while respecting daily limits.
4.  **Dashboard**: Real-time monitoring of reply rates and meeting bookings.

---

## ⚙️ Setup Instructions

### 1. Database Setup
1. Create a [Supabase](https://supabase.com/) project.
2. Run the migration script located in `supabase/migrations/20240505_initial_schema.sql`.
3. Add initial config values to the `config` table:
   ```sql
   INSERT INTO config (key, value) VALUES ('daily_send_limit', '20'), ('pipeline_paused', 'false');
   ```

### 2. Environment Variables
Create a `.env.local` file with the following:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_google_gemini_key
GMAIL_ADDRESS=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

### 3. Installation
```bash
npm install
npm run dev
```

### 4. Cron Jobs
To enable automation on Vercel, ensure your `vercel.json` is configured. Vercel will automatically detect the cron schedules defined in the file.

---

## 🛡️ Security
-   **RLS (Row Level Security)**: Configured in Supabase to protect data.
-   **Service Role**: Sensitive database operations are handled via a secure service client on the backend.
-   **Environment Protection**: Secret keys are never exposed to the client-side.

---

## 📄 License
MIT License. Created by Lucky Singh.

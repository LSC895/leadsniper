"use client";

import { useState, useEffect } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentLeads } from '@/components/dashboard/RecentLeads';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch recent leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(10);
      
      setLeads(leadsData || []);

      // Fetch stats
      const today = new Date().toISOString().split('T')[0];
      
      const { count: totalLeadsToday } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('scraped_at', `${today}T00:00:00Z`);

      const { count: emailsSent } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('outreach_status', 'sent')
        .gte('sent_at', `${today}T00:00:00Z`);

      const { count: totalSent } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('outreach_status', 'sent');

      const { count: replies } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('reply_received', true);

      const { count: meetings } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('meeting_booked', true);

      const replyRate = totalSent ? ((replies / totalSent) * 100).toFixed(1) + '%' : '0%';

      setStats({
        totalLeads: totalLeadsToday || 0,
        emailsSent: emailsSent || 0,
        replyRate,
        meetingsBooked: meetings || 0
      });

    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runPipeline = async () => {
    setRunning(true);
    toast.info('Starting pipeline run...');
    try {
      const res = await fetch('/api/cron/run-pipeline');
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Pipeline complete! Scraped: ${data.summary.scraped}, Qualified: ${data.summary.qualified}, Sent: ${data.summary.sent}`);
        fetchData();
      } else {
        toast.error(`Pipeline error: ${data.error}`);
      }
    } catch (error) {
      toast.error('Failed to run pipeline');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-500 mt-1">Monitor your lead generation and outreach performance.</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="border-[#333] hover:bg-[#252525] text-white"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold px-6 shadow-lg shadow-blue-500/20"
            onClick={runPipeline}
            disabled={running}
          >
            <Play className={`w-4 h-4 mr-2 ${running ? 'animate-pulse' : ''}`} />
            {running ? 'Running Pipeline...' : 'Run Pipeline Now'}
          </Button>
        </div>
      </div>

      <StatsCards stats={stats} loading={loading} />
      
      <div className="mt-12">
        <RecentLeads leads={leads} loading={loading} />
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from 'date-fns';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function PipelineLogs() {
  const [loading, setLoading] = useState(true);
  const [runs, setRuns] = useState([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('pipeline_runs')
        .select('*')
        .order('run_at', { ascending: false });
      
      setRuns(data || []);
    } catch (error) {
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Pipeline Logs</h2>
        <p className="text-gray-500 mt-1">Track the execution history of your automated pipeline.</p>
      </div>

      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-[#151515]">
            <TableRow className="border-[#333] hover:bg-transparent">
              <TableHead className="w-10"></TableHead>
              <TableHead className="text-gray-400">Timestamp</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400 text-center">Scraped</TableHead>
              <TableHead className="text-gray-400 text-center">Qualified</TableHead>
              <TableHead className="text-gray-400 text-center">Emails Sent</TableHead>
              <TableHead className="text-gray-400 text-right">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i} className="border-[#333]">
                  <TableCell colSpan={7}><div className="h-12 w-full bg-[#252525] animate-pulse rounded" /></TableCell>
                </TableRow>
              ))
            ) : runs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                  No pipeline runs recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              runs.map((run) => (
                <>
                  <TableRow 
                    key={run.id} 
                    className="border-[#333] hover:bg-[#202020] transition-colors cursor-pointer"
                    onClick={() => setExpandedRow(expandedRow === run.id ? null : run.id)}
                  >
                    <TableCell>
                      {expandedRow === run.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </TableCell>
                    <TableCell className="text-gray-300 font-medium">
                      {format(new Date(run.run_at), 'MMM d, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      {run.errors ? (
                        <div className="flex items-center gap-2 text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span>Failed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Success</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-white">{run.leads_scraped}</TableCell>
                    <TableCell className="text-center text-white">{run.leads_qualified}</TableCell>
                    <TableCell className="text-center text-white">{run.emails_sent}</TableCell>
                    <TableCell className="text-right text-gray-500">
                      {run.duration_ms ? `${(run.duration_ms / 1000).toFixed(2)}s` : '-'}
                    </TableCell>
                  </TableRow>
                  {expandedRow === run.id && run.errors && (
                    <TableRow className="bg-[#151515] border-[#333]">
                      <TableCell colSpan={7} className="p-4">
                        <div className="bg-[#201010] border border-red-900/50 rounded-lg p-4">
                          <p className="text-sm font-semibold text-red-400 mb-1">Error Log:</p>
                          <pre className="text-xs text-red-300 whitespace-pre-wrap">{run.errors}</pre>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

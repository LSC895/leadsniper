"use client";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';

interface Lead {
  id: string;
  source: string;
  title: string;
  url: string;
  ai_score: number | null;
  outreach_status: string;
  sent_at: string | null;
  scraped_at: string;
}

interface RecentLeadsProps {
  leads: Lead[];
  loading: boolean;
}

export function RecentLeads({ leads, loading }: RecentLeadsProps) {
  const getScoreColor = (score: number | null) => {
    if (!score) return 'bg-gray-500';
    if (score >= 8) return 'bg-green-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden">
      <div className="p-6 border-b border-[#333]">
        <h3 className="text-lg font-semibold text-white">Recent Leads</h3>
      </div>
      <Table>
        <TableHeader className="bg-[#151515]">
          <TableRow className="border-[#333] hover:bg-transparent">
            <TableHead className="text-gray-400">Source</TableHead>
            <TableHead className="text-gray-400">Title</TableHead>
            <TableHead className="text-gray-400 text-center">AI Score</TableHead>
            <TableHead className="text-gray-400">Status</TableHead>
            <TableHead className="text-gray-400">Scraped At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <TableRow key={i} className="border-[#333] hover:bg-[#202020]">
                <TableCell><div className="h-4 w-20 bg-[#252525] animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 w-48 bg-[#252525] animate-pulse rounded" /></TableCell>
                <TableCell><div className="mx-auto h-6 w-12 bg-[#252525] animate-pulse rounded-full" /></TableCell>
                <TableCell><div className="h-4 w-24 bg-[#252525] animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 w-32 bg-[#252525] animate-pulse rounded" /></TableCell>
              </TableRow>
            ))
          ) : leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                No leads found. Run the pipeline to start scraping.
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id} className="border-[#333] hover:bg-[#202020] transition-colors group">
                <TableCell className="text-gray-300">{lead.source}</TableCell>
                <TableCell className="max-w-md">
                  <a 
                    href={lead.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white font-medium hover:text-[#3b82f6] flex items-center gap-2"
                  >
                    {lead.title}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`${getScoreColor(lead.ai_score)} text-black border-none font-bold`}>
                    {lead.ai_score || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-[#444] text-gray-300 capitalize">
                    {lead.outreach_status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {formatDistanceToNow(new Date(lead.scraped_at), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

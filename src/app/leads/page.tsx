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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Download, 
  Search, 
  Filter, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function LeadsCRM() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let query = supabase.from('leads').select('*').order('scraped_at', { ascending: false });
      
      if (activeTab === 'needs_manual_dm') {
        query = query.eq('outreach_status', 'needs_manual_dm');
      }

      const { data } = await query;
      setLeads(data || []);
    } catch (error) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [activeTab]);

  const updateLead = async (id: string, updates: any) => {
    try {
      const { error } = await supabase.from('leads').update(updates).eq('id', id);
      if (error) throw error;
      
      setLeads(leads.map(l => l.id === id ? { ...l, ...updates } : l));
      toast.success('Lead updated');
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Source', 'URL', 'Score', 'Status', 'Sent At', 'Replied', 'Meeting', 'Contract'];
    const rows = leads.map(l => [
      l.title,
      l.source,
      l.url,
      l.ai_score,
      l.outreach_status,
      l.sent_at,
      l.reply_received,
      l.meeting_booked,
      l.contract_signed
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `leadsniper_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(l => 
    l.title.toLowerCase().includes(search.toLowerCase()) || 
    l.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Leads CRM</h2>
          <p className="text-gray-500 mt-1">Manage and track your lead outreach lifecycle.</p>
        </div>
        
        <Button 
          variant="outline" 
          className="border-[#333] hover:bg-[#252525] text-white"
          onClick={exportToCSV}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
            <TabsList className="bg-[#151515] border border-[#333]">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white">
                All Leads
              </TabsTrigger>
              <TabsTrigger value="needs_manual_dm" className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white">
                Needs Manual DM
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              placeholder="Search leads..." 
              className="pl-10 bg-[#151515] border-[#333] text-white focus:ring-[#3b82f6]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-[#151515]">
            <TableRow className="border-[#333] hover:bg-transparent">
              <TableHead className="text-gray-400">Lead</TableHead>
              <TableHead className="text-gray-400 text-center">Score</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400 text-center">Replied</TableHead>
              <TableHead className="text-gray-400 text-center">Meeting</TableHead>
              <TableHead className="text-gray-400 text-center">Contract</TableHead>
              <TableHead className="text-gray-400">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(10).fill(0).map((_, i) => (
                <TableRow key={i} className="border-[#333]">
                  <TableCell colSpan={7}><div className="h-12 w-full bg-[#252525] animate-pulse rounded" /></TableCell>
                </TableRow>
              ))
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="border-[#333] hover:bg-[#202020] transition-colors">
                  <TableCell className="max-w-[300px]">
                    <div className="flex flex-col">
                      <a 
                        href={lead.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white font-medium hover:text-[#3b82f6] flex items-center gap-2 truncate"
                      >
                        {lead.title}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="text-xs text-gray-500 mt-1">{lead.source}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={`${lead.ai_score >= 8 ? 'bg-green-500' : lead.ai_score >= 5 ? 'bg-yellow-500' : 'bg-red-500'} text-black border-none font-bold`}>
                      {lead.ai_score || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-[#444] text-gray-300 capitalize">
                      {lead.outreach_status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={lead.reply_received} 
                      onCheckedChange={(checked) => updateLead(lead.id, { reply_received: !!checked })}
                      className="border-[#444] data-[state=checked]:bg-[#3b82f6] data-[state=checked]:border-[#3b82f6]"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={lead.meeting_booked} 
                      onCheckedChange={(checked) => updateLead(lead.id, { meeting_booked: !!checked })}
                      className="border-[#444] data-[state=checked]:bg-[#3b82f6] data-[state=checked]:border-[#3b82f6]"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={lead.contract_signed} 
                      onCheckedChange={(checked) => updateLead(lead.id, { contract_signed: !!checked })}
                      className="border-[#444] data-[state=checked]:bg-[#3b82f6] data-[state=checked]:border-[#3b82f6]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      placeholder="Add notes..." 
                      className="bg-transparent border-none text-xs text-gray-400 focus:ring-0 focus:border-[#3b82f6] p-0 h-auto"
                      defaultValue={lead.notes || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (lead.notes || '')) {
                          updateLead(lead.id, { notes: e.target.value });
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

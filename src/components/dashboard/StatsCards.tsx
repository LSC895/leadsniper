"use client";

import { 
  Users, 
  Send, 
  MessageSquare, 
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsProps {
  stats: {
    totalLeads: number;
    emailsSent: number;
    replyRate: string;
    meetingsBooked: number;
  } | null;
  loading: boolean;
}

export function StatsCards({ stats, loading }: StatsProps) {
  const items = [
    { name: 'Total Leads Today', value: stats?.totalLeads ?? 0, icon: Users, color: 'text-blue-500' },
    { name: 'Emails Sent', value: stats?.emailsSent ?? 0, icon: Send, color: 'text-purple-500' },
    { name: 'Reply Rate', value: stats?.replyRate ?? '0%', icon: MessageSquare, color: 'text-green-500' },
    { name: 'Meetings Booked', value: stats?.meetingsBooked ?? 0, icon: Calendar, color: 'text-orange-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {items.map((item) => (
        <Card key={item.name} className="bg-[#1a1a1a] border-[#333] hover:border-[#444] transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-[#252525] ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-600" />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-24 bg-[#252525]" />
            ) : (
              <p className="text-2xl font-bold text-white">{item.value}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">{item.name}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

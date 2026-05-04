"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Table, 
  History, 
  Settings, 
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Leads CRM', href: '/leads', icon: Table },
  { name: 'Pipeline Logs', href: '/logs', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-[#1a1a1a] border-r border-[#333] h-screen fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <Target className="w-8 h-8 text-[#3b82f6]" />
        <h1 className="text-xl font-bold text-white tracking-tight">LeadSniper</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-[#3b82f6] text-white" 
                  : "text-gray-400 hover:text-white hover:bg-[#252525]"
              )}
            >
              <Icon className={cn(
                "w-5 h-5",
                isActive ? "text-white" : "text-gray-400 group-hover:text-white"
              )} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-[#333]">
        <div className="bg-[#252525] p-3 rounded-lg">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-gray-300">Pipeline Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

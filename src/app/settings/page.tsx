"use client";

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, X, Plus, Key, Mail, Database } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    daily_send_limit: 20,
    pipeline_paused: false,
    keywords: [],
  });
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('config').select('*');
      const configMap: any = {};
      data?.forEach(c => configMap[c.key] = c.value);

      setConfig({
        daily_send_limit: parseInt(configMap.daily_send_limit || '20'),
        pipeline_paused: configMap.pipeline_paused === 'true',
        keywords: (configMap.keywords || '').split(',').map((k: string) => k.trim()).filter(Boolean),
      });
    } catch (error) {
      toast.error('Failed to fetch configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const updates = [
        { key: 'daily_send_limit', value: config.daily_send_limit.toString() },
        { key: 'pipeline_paused', value: config.pipeline_paused.toString() },
        { key: 'keywords', value: config.keywords.join(', ') },
      ];

      for (const update of updates) {
        await supabase.from('config').upsert(update);
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (newKeyword && !config.keywords.includes(newKeyword)) {
      setConfig({ ...config, keywords: [...config.keywords, newKeyword] });
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setConfig({ ...config, keywords: config.keywords.filter(k => k !== keyword) });
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Settings</h2>
        <p className="text-gray-500 mt-1">Configure your API keys, limits, and scraping parameters.</p>
      </div>

      <div className="space-y-8">
        {/* Pipeline Control */}
        <Card className="bg-[#1a1a1a] border-[#333]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Pipeline Control</CardTitle>
            <CardDescription className="text-gray-500">Enable or disable the automated lead generation workflow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-300">Pause Pipeline</Label>
                <p className="text-sm text-gray-500">Temporarily stop all scraping and outreach activities.</p>
              </div>
              <Switch 
                checked={config.pipeline_paused}
                onCheckedChange={(checked) => setConfig({ ...config, pipeline_paused: checked })}
                className="data-[state=checked]:bg-[#3b82f6]"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-gray-300">Daily Outreach Limit</Label>
                <span className="text-[#3b82f6] font-bold">{config.daily_send_limit} emails</span>
              </div>
              <Slider 
                value={[config.daily_send_limit]}
                min={5}
                max={50}
                step={1}
                onValueChange={([val]) => setConfig({ ...config, daily_send_limit: val })}
                className="[&_[role=slider]]:bg-[#3b82f6] [&_[role=slider]]:border-[#3b82f6]"
              />
              <p className="text-xs text-gray-500">Gmail limits are strict. We recommend keeping this below 30 to avoid being flagged as spam.</p>
            </div>
          </CardContent>
        </Card>

        {/* Keywords */}
        <Card className="bg-[#1a1a1a] border-[#333]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Scraping Keywords</CardTitle>
            <CardDescription className="text-gray-500">Add or remove keywords used to find relevant leads on Upwork and Reddit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Add new keyword (e.g. Next.js, OpenAI)..." 
                className="bg-[#151515] border-[#333] text-white"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
              />
              <Button onClick={addKeyword} className="bg-[#3b82f6] hover:bg-[#2563eb]">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {config.keywords.map((kw) => (
                <Badge key={kw} variant="secondary" className="bg-[#252525] text-gray-300 hover:bg-[#333] py-1.5 px-3 flex items-center gap-2">
                  {kw}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-400" 
                    onClick={() => removeKeyword(kw)}
                  />
                </Badge>
              ))}
              {config.keywords.length === 0 && (
                <p className="text-sm text-gray-600 italic">No keywords added yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Credentials (Static Info) */}
        <Card className="bg-[#1a1a1a] border-[#333]">
          <CardHeader>
            <CardTitle className="text-white text-lg">System Credentials</CardTitle>
            <CardDescription className="text-gray-500">Environment variables currently configured in your deployment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#151515] border border-[#333] flex items-center gap-4">
                <Key className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Anthropic API</p>
                  <p className="text-sm text-gray-300">••••••••••••••••</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[#151515] border border-[#333] flex items-center gap-4">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Gmail SMTP</p>
                  <p className="text-sm text-gray-300">••••••••••••••••</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[#151515] border border-[#333] flex items-center gap-4">
                <Database className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Supabase URL</p>
                  <p className="text-sm text-gray-300">••••••••••••••••</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[#151515] border border-[#333] flex items-center gap-4">
                <Key className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Supabase Key</p>
                  <p className="text-sm text-gray-300">••••••••••••••••</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 italic">Note: Sensitive keys are managed via environment variables and cannot be edited directly here for security reasons.</p>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button 
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold px-8 h-12"
            onClick={saveConfig}
            disabled={saving}
          >
            <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-pulse' : ''}`} />
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

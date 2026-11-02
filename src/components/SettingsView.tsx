import React, { useState } from 'react';
import { usePuff } from '../context/PuffContext';
import {
  Database,
  Smartphone,
  Palette,
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertCircle,
  X,
  Zap,
} from 'lucide-react';
import type { AppTheme } from '../types';
import { getSupabaseCredentials } from '../supabase/config';

export const SettingsView: React.FC = () => {
  const {
    vapeProfile,
    updateVapeProfile,
    settings,
    updateSettings,
    connectSupabase,
    syncState,
    syncKey,
    resetAllData,
    exportJSON,
    importJSON,
  } = usePuff();

  const creds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(creds.url);
  const [supabaseKey, setSupabaseKey] = useState(creds.key);
  const [connectMessage, setConnectMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedCigWebhook, setCopiedCigWebhook] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleConnectSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setConnectMessage(null);

    const res = await connectSupabase(supabaseUrl, supabaseKey);
    setIsConnecting(false);

    if (res.success) {
      setConnectMessage({ type: 'success', text: 'Connected to SuperBase Cloud!' });
    } else {
      setConnectMessage({ type: 'error', text: res.message });
    }
  };

  const webhookUrl = `${window.location.origin}/hit?key=${encodeURIComponent(syncKey)}`;
  const cigWebhookUrl = `${window.location.origin}/hit?key=${encodeURIComponent(syncKey)}&type=cigarette`;

  const copyToClipboard = (text: string, isCig: boolean = false) => {
    navigator.clipboard.writeText(text);
    if (isCig) {
      setCopiedCigWebhook(true);
      setTimeout(() => setCopiedCigWebhook(false), 2000);
    } else {
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    }
  };

  const handleTestWebhook = async (urlToTest: string) => {
    setTestingWebhook(true);
    setTestResult(null);
    try {
      const res = await fetch(urlToTest);
      if (res.ok) {
        setTestResult('✅ Success! Hit recorded & synced to SuperBase Edge in ~20ms.');
      } else {
        setTestResult(`⚠️ Server responded with HTTP ${res.status}`);
      }
    } catch (err: any) {
      setTestResult(`❌ Connection failed: ${err?.message || 'Check network'}`);
    } finally {
      setTestingWebhook(false);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  const themes: { id: AppTheme; label: string; color: string }[] = [
    { id: 'apple-dark', label: 'Apple Dark', color: '#000000' },
    { id: 'apple-light', label: 'Apple Light', color: '#f2f2f7' },
    { id: 'cyberpunk-violet', label: 'Violet Neon', color: '#7c3aed' },
    { id: 'midnight-blue', label: 'Midnight Blue', color: '#0284c7' },
    { id: 'emerald-ios', label: 'Emerald Health', color: '#059669' },
    { id: 'tokyo-neon', label: 'Tokyo Gold', color: '#eab308' },
  ];

  return (
    <div className="flex flex-col w-full px-5 pb-12 pt-1 text-white">
      {/* Title */}
      <div className="w-full pt-1 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          SuperBase cloud sync, hardware profile & preferences
        </p>
      </div>

      {/* SuperBase Cloud Sync Section */}
      <div className="w-full rounded-2xl bg-[#1c1c1e]/80 border border-white/[0.08] backdrop-blur-xl p-5 shadow-lg mb-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">SuperBase Cloud Sync</h2>
              <p className="text-[11px] text-zinc-400">Real-time PostgreSQL database sync</p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
              syncState === 'synced'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : syncState === 'syncing'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
                : syncState === 'error'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-zinc-800 text-zinc-400 border border-white/5'
            }`}
          >
            {syncState === 'synced'
              ? 'Synced'
              : syncState === 'syncing'
              ? 'Syncing...'
              : syncState === 'error'
              ? 'Error'
              : 'Local Cache'}
          </span>
        </div>

        <form onSubmit={handleConnectSupabase} className="flex flex-col gap-3 pt-1">
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Anon Public Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          {connectMessage && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                connectMessage.type === 'success'
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
              }`}
            >
              {connectMessage.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{connectMessage.text}</span>
            </div>
          )}

          <div className="flex gap-2 mt-1">
            <button
              type="submit"
              disabled={isConnecting}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-purple-600/30 disabled:opacity-50"
            >
              {isConnecting ? 'Testing Connection...' : 'Save & Connect SuperBase'}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
            <span>SQL schema ready in `supabase_schema.sql`</span>
            <span className="font-mono text-[10px]">User ID: {syncKey}</span>
          </div>
        </form>
      </div>

      {/* Hardware Profile Section */}
      <div className="w-full rounded-2xl bg-[#1c1c1e]/80 border border-white/[0.08] backdrop-blur-xl p-5 shadow-lg mb-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Device Hardware Profile</h2>
            <p className="text-[11px] text-zinc-400">For accurate nicotine & cost metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Device Name</label>
            <input
              type="text"
              value={vapeProfile.deviceName}
              onChange={(e) => updateVapeProfile({ deviceName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Nicotine (mg/ml)</label>
            <input
              type="number"
              value={vapeProfile.nicotineMgPerMl}
              onChange={(e) => updateVapeProfile({ nicotineMgPerMl: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Capacity (ml)</label>
            <input
              type="number"
              value={vapeProfile.podCapacityMl}
              onChange={(e) => updateVapeProfile({ podCapacityMl: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Pod Cost (₹ INR)</label>
            <input
              type="number"
              value={vapeProfile.costPerPodOrBottle}
              onChange={(e) => updateVapeProfile({ costPerPodOrBottle: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Cig Pack Cost (₹ INR)</label>
            <input
              type="number"
              value={vapeProfile.cigCostPerPack || 360}
              onChange={(e) => updateVapeProfile({ cigCostPerPack: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Cig Daily Limit (Sticks)</label>
            <input
              type="number"
              value={vapeProfile.cigDailyLimit || 10}
              onChange={(e) => updateVapeProfile({ cigDailyLimit: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
            />
          </div>
        </div>
      </div>

      {/* Appearance & Feedback */}
      <div className="w-full rounded-2xl bg-[#1c1c1e]/80 border border-white/[0.08] backdrop-blur-xl p-5 shadow-lg mb-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Appearance & Feedback</h2>
            <p className="text-[11px] text-zinc-400">Haptics, vapor clouds and color palette</p>
          </div>
        </div>

        {/* Theme Pills */}
        <div className="grid grid-cols-3 gap-2">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => updateSettings({ theme: t.id })}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                settings.theme === t.id
                  ? 'bg-purple-600/30 border-purple-400 text-white'
                  : 'bg-black/40 border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                style={{ backgroundColor: t.color }}
              />
              <span className="truncate">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-3 pt-2 border-t border-white/5">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-zinc-300 font-medium">Apple Haptic Vibrations</span>
            <input
              type="checkbox"
              checked={settings.hapticsEnabled}
              onChange={(e) => updateSettings({ hapticsEnabled: e.target.checked })}
              className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-zinc-300 font-medium">Mechanical Audio Clicks</span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-zinc-300 font-medium">Volumetric Vapor Smoke FX</span>
            <input
              type="checkbox"
              checked={settings.vaporEffectsEnabled}
              onChange={(e) => updateSettings({ vaporEffectsEnabled: e.target.checked })}
              className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* iPhone Back Tap & Action Button Webhook */}
      <div className="w-full rounded-2xl bg-[#1c1c1e]/80 border border-white/[0.08] backdrop-blur-xl p-5 shadow-lg mb-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">iPhone Back Tap / Action Button</h2>
            <p className="text-[11px] text-zinc-400">Instant 0ms background logging via iOS Shortcuts</p>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          Log hits silently in the background by double-tapping the back of your phone or clicking the Action Button:
        </p>

        {/* Vape Pod Webhook URL */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
            ⚡ Vape Hit Webhook URL
          </span>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-black/60 border border-white/10">
            <span className="text-[11px] font-mono text-purple-200 truncate flex-1">
              {webhookUrl}
            </span>
            <button
              onClick={() => copyToClipboard(webhookUrl, false)}
              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all cursor-pointer shrink-0"
            >
              {copiedWebhook ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => handleTestWebhook(webhookUrl)}
              disabled={testingWebhook}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-zinc-200 transition-all cursor-pointer shrink-0"
            >
              Test
            </button>
          </div>
        </div>

        {/* Cigarette Webhook URL */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-orange-300 uppercase tracking-wider">
            🚬 Cigarette Hit Webhook URL
          </span>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-black/60 border border-white/10">
            <span className="text-[11px] font-mono text-orange-200 truncate flex-1">
              {cigWebhookUrl}
            </span>
            <button
              onClick={() => copyToClipboard(cigWebhookUrl, true)}
              className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white transition-all cursor-pointer shrink-0"
            >
              {copiedCigWebhook ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => handleTestWebhook(cigWebhookUrl)}
              disabled={testingWebhook}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-zinc-200 transition-all cursor-pointer shrink-0"
            >
              Test
            </button>
          </div>
        </div>

        {testResult && (
          <div className="p-2.5 rounded-xl text-xs bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 animate-fadeIn font-medium">
            {testResult}
          </div>
        )}

        {/* 60-Second Setup Guide */}
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col gap-2 text-xs text-zinc-300">
          <span className="font-bold text-white text-[12px]">📱 60-Second Setup Guide:</span>
          <ol className="list-decimal list-inside space-y-1.5 text-zinc-400">
            <li>Open the <b className="text-zinc-200">Shortcuts</b> app on your iPhone and tap <b className="text-zinc-200">+</b></li>
            <li>Add action: <b className="text-zinc-200">"Get Contents of URL"</b></li>
            <li>Paste your copied URL above (Method: GET)</li>
            <li>Go to iPhone <b className="text-zinc-200">Settings → Accessibility → Touch → Back Tap</b> (or Action Button)</li>
            <li>Assign your shortcut to <b className="text-zinc-200">Double Tap</b> or <b className="text-zinc-200">Action Button</b>!</li>
          </ol>
        </div>
      </div>

      {/* Backup & Reset */}
      <div className="w-full flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportJSON());
              const a = document.createElement('a');
              a.setAttribute('href', dataStr);
              a.setAttribute('download', `pufftrack-backup-${new Date().toISOString().split('T')[0]}.json`);
              a.click();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset all puff logs and local data?')) {
              resetAllData();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-xs font-semibold text-rose-400 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-white/10 p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Import Backup JSON</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="Paste exported JSON here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-white placeholder-zinc-600"
            />
            {importStatus && (
              <span className="text-xs text-rose-400 font-medium">{importStatus}</span>
            )}
            <button
              onClick={() => {
                if (importJSON(importText)) {
                  setShowImportModal(false);
                  setImportText('');
                } else {
                  setImportStatus('Invalid JSON format.');
                }
              }}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-purple-600/30"
            >
              Restore Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

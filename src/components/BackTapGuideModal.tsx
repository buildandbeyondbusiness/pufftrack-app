import React, { useState, useEffect } from 'react';
import { Zap, Copy, Check, X, Globe, Send } from 'lucide-react';
import { usePuff } from '../context/PuffContext';
import { backendApi } from '../services/backendApi';

interface BackTapGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackTapGuideModal: React.FC<BackTapGuideModalProps> = ({ isOpen, onClose }) => {
  const { syncKey, addPuff } = usePuff();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [serverUrl, setServerUrl] = useState(backendApi.getBackendUrl());
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setServerUrl(backendApi.getBackendUrl());
  }, [isOpen]);

  const backendShortcutUrl = `${serverUrl}/hit?key=${syncKey}`;

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(backendShortcutUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleServerUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setServerUrl(val);
    backendApi.setBackendUrl(val);
  };

  const handleTestHit = async () => {
    setIsTesting(true);
    setTestStatus('Pinging Cloudflare Edge...');
    const res = await backendApi.logHit(syncKey, 'TestHit');
    setIsTesting(false);
    if (res && res.success) {
      setTestStatus(`✅ Success! Hit logged via Cloudflare Edge (${res.provider || 'instant'})`);
      addPuff('Habit', 'Test Edge Hit');
    } else {
      setTestStatus('⚠️ Webhook sent. Check internet connectivity.');
    }
    setTimeout(() => setTestStatus(null), 4000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#14151f] rounded-[28px] p-6 w-full max-w-sm flex flex-col gap-4 relative max-h-[85vh] overflow-y-auto scrollbar-none border border-white/15 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              iPhone Back Tap Setup
            </h3>
            <p className="text-xs text-zinc-400">Instant background logging</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.04] p-3.5 border border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
            <span>Your Personal Edge Webhook URL:</span>
            <span className="text-[10px] text-emerald-400 font-bold">Cloudflare Edge</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={backendShortcutUrl}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs font-mono text-emerald-300 outline-none select-all"
            />
            <button
              onClick={handleCopyUrl}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
            >
              {copiedUrl ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Live Test Webhook Trigger */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleTestHit}
            disabled={isTesting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5 text-emerald-400" />
            <span>{isTesting ? 'Sending...' : '⚡️ Test Webhook Now'}</span>
          </button>
          {testStatus && (
            <div className="text-[11px] text-center font-medium text-emerald-300 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
              {testStatus}
            </div>
          )}
        </div>

        {/* Setup Steps */}
        <div className="flex flex-col gap-2.5 text-xs text-zinc-300">
          <div className="font-bold text-white uppercase text-[10px] tracking-wider text-zinc-400">
            3-Step iOS Shortcuts Setup:
          </div>

          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-[10px] text-white">
              1
            </span>
            <p className="leading-snug">
              Open the <strong>Shortcuts app</strong> on your iPhone and tap <strong>+ (New Shortcut)</strong>.
            </p>
          </div>

          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-[10px] text-white">
              2
            </span>
            <p className="leading-snug">
              Add action: <strong>Get Contents of URL</strong> → paste the URL above → change method to <strong>GET</strong>.
            </p>
          </div>

          <div className="flex gap-2.5 items-start">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-[10px] text-white">
              3
            </span>
            <p className="leading-snug">
              Go to <strong>Settings → Accessibility → Touch → Back Tap</strong> → assign <strong>Double Tap</strong> to this shortcut.
            </p>
          </div>
        </div>

        {/* Server Endpoint Config */}
        <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3 text-cyan-400" />
              API Server
            </span>
            <span className="text-[10px] font-mono text-zinc-400">Cloudflare Pages</span>
          </div>
          <input
            type="text"
            value={serverUrl}
            onChange={handleServerUrlChange}
            placeholder="https://pufftrack-app.pages.dev"
            className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-1.5 text-[11px] font-mono text-zinc-300 outline-none"
          />
        </div>
      </div>
    </div>
  );
};

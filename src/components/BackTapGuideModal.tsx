import React, { useState, useEffect } from 'react';
import { Zap, Copy, Check, X, Sliders, Server, Send } from 'lucide-react';
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
    setTestStatus('Pinging server...');
    const res = await backendApi.logHit(syncKey, 'TestHit');
    setIsTesting(false);
    if (res && res.success) {
      setTestStatus(`✅ Success! Hit #${res.todayCount} logged on Render`);
      addPuff('Habit', 'Test Server Hit');
    } else {
      setTestStatus('⚠️ Server response pending or booting up');
    }
    setTimeout(() => setTestStatus(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="glass-panel p-6 w-full max-w-sm flex flex-col gap-4 relative max-h-[85vh] overflow-y-auto scrollbar-none border border-white/20 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Render Server Shortcut Setup</h3>
            <p className="text-[11px] text-zinc-400 font-medium">Silent background logging via Render Express</p>
          </div>
        </div>

        {/* Server Domain Customization Input */}
        <div className="rounded-2xl bg-white/5 p-3 border border-white/10 flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold text-zinc-400 uppercase">Render Server URL:</label>
          <input
            type="text"
            value={serverUrl}
            onChange={handleServerUrlChange}
            placeholder="https://pufftrack-backend.onrender.com"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-emerald-300 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Copy Trigger URL Card */}
        <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-300">
            <span>iOS Shortcut Webhook URL:</span>
            <span className="text-[10px] text-emerald-400 font-mono">4.5m Heartbeat</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={backendShortcutUrl}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-[10px] font-mono text-emerald-300 truncate"
            />
            <button
              onClick={handleCopyUrl}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shrink-0 flex items-center gap-1 shadow-md hover:opacity-90 active:scale-95 transition-all"
            >
              {copiedUrl ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Test Hit Button */}
          <button
            onClick={handleTestHit}
            disabled={isTesting}
            className="w-full mt-1 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-bold text-emerald-300 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isTesting ? 'Testing Server...' : '🧪 Test Server Webhook Hit'}</span>
          </button>

          {testStatus && (
            <div className="text-[11px] font-semibold text-center text-emerald-400 mt-1 animate-in fade-in">
              {testStatus}
            </div>
          )}
        </div>

        {/* Step-by-Step Setup Guide */}
        <div className="flex flex-col gap-3 pt-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <Sliders className="h-3.5 w-3.5 text-emerald-400" />
            3-Step iOS Shortcut Setup
          </h4>

          <div className="flex flex-col gap-2 text-xs text-zinc-300">
            <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-black font-bold text-[10px]">1</span>
              <div>
                <strong className="text-emerald-300">Add "Get Contents of URL":</strong> Open iOS <strong>Shortcuts</strong> &rarr; tap <strong>+</strong> &rarr; Add action <strong>Get Contents of URL</strong> &rarr; Paste Webhook URL above.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/5 border border-white/5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white font-bold text-[10px]">2</span>
              <div>
                <strong className="text-white">Set Back Tap:</strong> Open iOS <strong>Settings</strong> &rarr; <strong>Accessibility</strong> &rarr; <strong>Touch</strong> &rarr; <strong>Back Tap</strong>.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/5 border border-white/5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white font-bold text-[10px]">3</span>
              <div>
                <strong className="text-white">Assign to Double Tap:</strong> Select <strong>Double Tap</strong> &rarr; choose your <strong>PuffTrack</strong> shortcut!
              </div>
            </div>
          </div>
        </div>

        {/* Render 4.5m Heartbeat Note */}
        <div className="rounded-2xl bg-indigo-500/10 p-3 border border-indigo-500/20 text-[11px] text-indigo-300 flex flex-col gap-1">
          <div className="font-bold flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            4.5-Minute Anti-Sleep Heartbeat Loop
          </div>
          <div>
            The app and backend ping each other every <strong>4.5 minutes</strong> to keep Render awake 24/7 with zero cold starts!
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all mt-1"
        >
          Got It!
        </button>
      </div>
    </div>
  );
};

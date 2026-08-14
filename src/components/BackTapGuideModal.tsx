import React, { useState } from 'react';
import { Smartphone, Zap, Copy, Check, X, Sliders } from 'lucide-react';

interface BackTapGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackTapGuideModal: React.FC<BackTapGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const shortcutUrl = "https://buildandbeyondbusiness.github.io/pufftrack-app/?action=puff";

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shortcutUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
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
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">iPhone Back Tap Setup</h3>
            <p className="text-[11px] text-zinc-400 font-medium">Log puffs by tapping the back of your phone</p>
          </div>
        </div>

        {/* Copy Trigger URL Card */}
        <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10 flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-zinc-300">Your Quick Trigger URL:</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shortcutUrl}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-[10px] font-mono text-indigo-300 truncate"
            />
            <button
              onClick={handleCopyUrl}
              className="px-3 py-1.5 rounded-xl bg-[var(--accent-purple)] text-white text-xs font-bold shrink-0 flex items-center gap-1 shadow-md hover:opacity-90 active:scale-95 transition-all"
            >
              {copiedUrl ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Setup Guide */}
        <div className="flex flex-col gap-3 pt-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <Sliders className="h-3.5 w-3.5 text-emerald-400" />
            3-Step iPhone Setup Guide
          </h4>

          <div className="flex flex-col gap-2 text-xs text-zinc-300">
            <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/5 border border-white/5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white font-bold text-[10px]">1</span>
              <div>
                <strong className="text-white">Create iOS Shortcut:</strong> Open the iOS <strong>Shortcuts</strong> app &rarr; tap <strong>+</strong> &rarr; Add action <strong>Open URLs</strong> &rarr; Paste the Trigger URL above.
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
                <strong className="text-white">Assign to Double Tap:</strong> Select <strong>Double Tap</strong> &rarr; scroll down to Shortcuts &rarr; select your <strong>PuffTrack</strong> shortcut!
              </div>
            </div>
          </div>
        </div>

        {/* Action Button & Hardware Note */}
        <div className="rounded-2xl bg-indigo-500/10 p-3 border border-indigo-500/20 text-[11px] text-indigo-300 flex flex-col gap-1">
          <div className="font-bold flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" />
            iPhone 15 Pro / 16 Action Button Support
          </div>
          <div>
            You can also assign this Shortcut to your physical <strong>Action Button</strong> in iOS Settings &rarr; Action Button!
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-[var(--accent-purple)] text-white text-xs font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all mt-1"
        >
          Got It!
        </button>
      </div>
    </div>
  );
};

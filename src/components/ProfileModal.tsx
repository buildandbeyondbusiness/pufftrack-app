import React, { useState, useEffect } from 'react';
import { usePuff } from '../context/PuffContext';
import {
  X,
  LogIn,
  LogOut,
  Cloud,
  CloudOff,
  Palette,
  Volume2,
  Download,
  Upload,
  Trash2,
  Check,
  DownloadCloud,
  Zap,
  ShieldCheck
} from 'lucide-react';
import type { AppTheme } from '../types';
import { isFirebaseConfigured } from '../firebase/config';
import { BackTapGuideModal } from './BackTapGuideModal';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    isCloudSyncing,
    settings,
    signInWithGoogle,
    signOutUser,
    updateSettings,
    resetAllData,
    exportJSON,
    importJSON,
  } = usePuff();

  const [importText, setImportText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [showBackTapGuide, setShowBackTapGuide] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setIsPwaInstalled(true);
        }
        setDeferredPrompt(null);
      });
    } else {
      alert("To install on iOS: Tap the Share button in Safari, then select 'Add to Home Screen' 📲");
    }
  };

  const themes: { id: AppTheme; label: string; bg: string }[] = [
    { id: 'apple-dark', label: 'Apple Dark', bg: 'bg-zinc-900 text-white border-zinc-700' },
    { id: 'apple-light', label: 'Apple Light', bg: 'bg-zinc-100 text-black border-zinc-300' },
    { id: 'midnight-blue', label: 'Midnight Blue', bg: 'bg-sky-950 text-sky-300 border-sky-800' },
    { id: 'emerald-ios', label: 'Emerald Mint', bg: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
  ];

  const handleExport = () => {
    const json = exportJSON();
    navigator.clipboard.writeText(json);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (importJSON(importText)) {
      alert('Data imported successfully!');
      setShowImportArea(false);
      setImportText('');
    } else {
      alert('Failed to import JSON data.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md transition-all animate-in fade-in duration-200 p-0 sm:p-4">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 shadow-2xl backdrop-blur-3xl scrollbar-none flex flex-col gap-5">
        {/* Modal Handle & Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-1.5 w-12 rounded-full bg-white/20 sm:hidden" />
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-[var(--text-main)]">
                Profile & Settings
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-medium">
                Cloud Sync, Haptics, Themes & Preferences
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/20 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Google Account Cloud Card */}
        <div className="rounded-2xl bg-white/5 p-4 border border-[var(--border-subtle)] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
              {user ? <Cloud className="h-4 w-4 text-emerald-400" /> : <CloudOff className="h-4 w-4 text-amber-400" />}
              <span>Google Cloud Sync</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-[var(--text-main)]">
              <span
                className={`h-2 w-2 rounded-full ${
                  user ? (isCloudSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400') : 'bg-zinc-500'
                }`}
              />
              <span>{user ? (isCloudSyncing ? 'Syncing...' : 'Cloud Connected') : 'Local Mode'}</span>
            </div>
          </div>

          {user ? (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Avatar"
                    className="h-11 w-11 rounded-full border-2 border-[var(--accent-purple)] shadow-md"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-purple-glow)] text-[var(--accent-purple)] font-bold text-lg">
                    {user.displayName ? user.displayName[0] : 'U'}
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-[var(--text-main)]">{user.displayName || 'Google User'}</div>
                  <div className="text-xs text-[var(--text-muted)] truncate max-w-[180px]">{user.email}</div>
                </div>
              </div>

              <button
                onClick={signOutUser}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-white/5 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-1">
              <p className="text-xs text-[var(--text-muted)]">
                Sign in with Google to back up your puff history and seamlessly sync hits across all your devices.
              </p>
              <button
                onClick={signInWithGoogle}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white text-black font-bold text-xs shadow-lg hover:bg-zinc-100 transition-all active:scale-95 cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign in with Google Account</span>
              </button>

              {!isFirebaseConfigured() && (
                <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>Demo Firebase keys active. Local offline storage is running.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* iPhone Back Tap Shortcut Guide Button */}
        <div className="rounded-2xl bg-white/5 p-4 border border-[var(--border-subtle)] flex items-center justify-between border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--text-main)]">Silent iPhone Back Tap</div>
              <div className="text-[10px] text-[var(--text-muted)] font-medium">
                Log hits in background without unlocking or opening Safari
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowBackTapGuide(true)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-500 active:scale-95 transition-all cursor-pointer"
          >
            Setup
          </button>
        </div>

        {/* Back Tap Setup Guide Modal */}
        <BackTapGuideModal isOpen={showBackTapGuide} onClose={() => setShowBackTapGuide(false)} />

        {/* PWA Mobile Install Banner */}
        {!isPwaInstalled && (
          <div className="rounded-2xl bg-white/5 p-4 flex items-center justify-between border-l-4 border-l-[var(--accent-purple)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--bg-accent-pill)] text-[var(--accent-purple)]">
                <DownloadCloud className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--text-main)]">Install Mobile App</div>
                <div className="text-[10px] text-[var(--text-muted)]">Add to Home Screen for native experience</div>
              </div>
            </div>

            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--accent-purple)] text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 cursor-pointer"
            >
              Install
            </button>
          </div>
        )}

        {/* Theme Selector */}
        <div className="rounded-2xl bg-white/5 p-4 border border-[var(--border-subtle)] flex flex-col gap-3">
          <h3 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5 uppercase tracking-wider">
            <Palette className="h-3.5 w-3.5 text-[var(--accent-pink)]" />
            Apple Theme Mode
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => updateSettings({ theme: t.id })}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                  settings.theme === t.id ? 'ring-2 ring-[var(--accent-purple)]' : 'opacity-80'
                } ${t.bg}`}
              >
                <span>{t.label}</span>
                {settings.theme === t.id && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback & Audio Effects */}
        <div className="rounded-2xl bg-white/5 p-4 border border-[var(--border-subtle)] flex flex-col gap-3">
          <h3 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5 uppercase tracking-wider">
            <Volume2 className="h-3.5 w-3.5 text-[var(--accent-green)]" />
            Feedback & Synthesizer
          </h3>

          <div className="flex flex-col gap-2">
            <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 cursor-pointer">
              <span className="text-xs font-semibold text-[var(--text-main)]">Web Audio Synthesizer</span>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="h-4 w-4 rounded accent-[var(--accent-purple)] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 cursor-pointer">
              <span className="text-xs font-semibold text-[var(--text-main)]">Haptic Vibration</span>
              <input
                type="checkbox"
                checked={settings.hapticsEnabled}
                onChange={(e) => updateSettings({ hapticsEnabled: e.target.checked })}
                className="h-4 w-4 rounded accent-[var(--accent-purple)] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 cursor-pointer">
              <span className="text-xs font-semibold text-[var(--text-main)]">Canvas Vapor Particles</span>
              <input
                type="checkbox"
                checked={settings.vaporEffectsEnabled}
                onChange={(e) => updateSettings({ vaporEffectsEnabled: e.target.checked })}
                className="h-4 w-4 rounded accent-[var(--accent-purple)] cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Data Management & Backup */}
        <div className="rounded-2xl bg-white/5 p-4 border border-[var(--border-subtle)] flex flex-col gap-3">
          <h3 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5 uppercase tracking-wider">
            <Download className="h-3.5 w-3.5 text-sky-400" />
            Data Management
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/5 text-xs font-semibold text-[var(--text-main)] hover:bg-white/10 transition-all border border-white/5 cursor-pointer"
            >
              {copySuccess ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Download className="h-3.5 w-3.5" />}
              <span>{copySuccess ? 'Copied JSON!' : 'Export JSON'}</span>
            </button>

            <button
              onClick={() => setShowImportArea(!showImportArea)}
              className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/5 text-xs font-semibold text-[var(--text-main)] hover:bg-white/10 transition-all border border-white/5 cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import JSON</span>
            </button>
          </div>

          {showImportArea && (
            <form onSubmit={handleImportSubmit} className="flex flex-col gap-2 mt-1">
              <textarea
                rows={3}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste JSON backup text here..."
                className="w-full rounded-xl bg-white/5 border border-[var(--border-subtle)] p-2 text-xs font-mono text-[var(--text-main)] outline-none"
              />
              <button
                type="submit"
                className="py-1.5 px-4 rounded-xl bg-[var(--accent-purple)] text-xs font-bold text-white shadow-md cursor-pointer"
              >
                Apply Restore
              </button>
            </form>
          )}

          <div className="border-t border-white/10 pt-2 mt-1">
            <button
              onClick={() => {
                if (window.confirm('Reset all puff logs, pod counts and local settings?')) {
                  resetAllData();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl bg-red-500/10 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Reset Local Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { usePuff } from '../context/PuffContext';
import { LogIn, LogOut, Cloud, CloudOff, Smartphone, Palette, Volume2, Download, Upload, Trash2, Check, DownloadCloud } from 'lucide-react';
import type { AppTheme, VapeDeviceType } from '../types';
import { isFirebaseConfigured } from '../firebase/config';

export const ProfileView: React.FC = () => {
  const {
    user,
    isCloudSyncing,
    vapeProfile,
    settings,
    signInWithGoogle,
    signOutUser,
    updateVapeProfile,
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

  // Catch PWA Install Prompt
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

  const deviceTypes: VapeDeviceType[] = ['Disposable', 'Pod System', 'Sub-Ohm Mod', 'Nic Salt Tank'];

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
    <div className="flex flex-col gap-5 px-4 pb-20 pt-4">
      {/* View Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-main)]">
          Account & Device
        </h1>
        <p className="text-xs text-[var(--text-muted)] font-medium">
          Cloud Sync, Profile & Preferences
        </p>
      </div>

      {/* Google Account Cloud Card */}
      <div className="glass-panel p-4 flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
            {user ? <Cloud className="h-4 w-4 text-emerald-400" /> : <CloudOff className="h-4 w-4 text-amber-400" />}
            <span>Google Cloud Sync</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-[var(--text-main)]">
            <span className={`h-2 w-2 rounded-full ${user ? (isCloudSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400') : 'bg-zinc-500'}`} />
            <span>{user ? (isCloudSyncing ? 'Syncing...' : 'Cloud Connected') : 'Local Mode'}</span>
          </div>
        </div>

        {user ? (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="h-11 w-11 rounded-full border-2 border-[var(--accent-purple)] shadow-md" />
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-white/5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-1">
            <p className="text-xs text-[var(--text-muted)]">
              Sign in with your Google account to back up and sync your puff hits across all your devices in real-time.
            </p>
            <button
              onClick={signInWithGoogle}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white text-black font-bold text-xs shadow-lg hover:bg-zinc-100 transition-all active:scale-95"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign in with Google Account</span>
            </button>

            {!isFirebaseConfigured() && (
              <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                💡 <strong>Firebase Setup Note:</strong> Using demo credentials. Update your keys in <code className="bg-black/30 px-1 py-0.5 rounded">src/firebase/config.ts</code> or environment variables for your own Firebase project.
              </div>
            )}
          </div>
        )}
      </div>

      {/* PWA Mobile Install Banner */}
      {!isPwaInstalled && (
        <div className="glass-panel p-4 flex items-center justify-between border-l-4 border-l-[var(--accent-purple)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--bg-accent-pill)] text-[var(--accent-purple)]">
              <DownloadCloud className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--text-main)]">Install App on Phone</div>
              <div className="text-[10px] text-[var(--text-muted)]">Add to Home Screen for PWA experience</div>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--accent-purple)] text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95"
          >
            Install
          </button>
        </div>
      )}

      {/* Vape Profile Setup */}
      <div className="glass-panel p-4 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-1.5">
          <Smartphone className="h-4 w-4 text-[var(--accent-purple)]" />
          Vape Device & Limits
        </h3>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-xs text-[var(--text-muted)] font-medium mb-1 block">Device Model</label>
            <input
              type="text"
              value={vapeProfile.deviceName}
              onChange={(e) => updateVapeProfile({ deviceName: e.target.value })}
              className="w-full rounded-2xl bg-white/5 border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent-purple)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-[var(--text-muted)] font-medium mb-1 block">Device Type</label>
              <select
                value={vapeProfile.deviceType}
                onChange={(e) => updateVapeProfile({ deviceType: e.target.value as VapeDeviceType })}
                className="w-full rounded-2xl bg-white/5 border border-[var(--border-subtle)] px-2 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent-purple)]"
              >
                {deviceTypes.map((t) => (
                  <option key={t} value={t} className="bg-[#12121c] text-white">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-[var(--text-muted)] font-medium mb-1 block">Nicotine (mg/ml)</label>
              <input
                type="number"
                step="0.1"
                value={vapeProfile.nicotineMgPerMl}
                onChange={(e) => updateVapeProfile({ nicotineMgPerMl: Number(e.target.value) })}
                className="w-full rounded-2xl bg-white/5 border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent-purple)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-[var(--text-muted)] font-medium mb-1 block">Vol (ml)</label>
              <input
                type="number"
                step="0.5"
                value={vapeProfile.podCapacityMl}
                onChange={(e) => updateVapeProfile({ podCapacityMl: Number(e.target.value) })}
                className="w-full rounded-2xl bg-white/5 border border-[var(--border-subtle)] px-2.5 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent-purple)]"
              />
            </div>

            <div>
              <label className="text-xs text-[var(--text-muted)] font-medium mb-1 block">Est. Puffs</label>
              <input
                type="number"
                value={vapeProfile.totalPuffsPerPod}
                onChange={(e) => updateVapeProfile({ totalPuffsPerPod: Number(e.target.value) })}
                className="w-full rounded-2xl bg-white/5 border border-[var(--border-subtle)] px-2.5 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent-purple)]"
              />
            </div>

            <div>
              <label className="text-xs text-[var(--text-muted)] font-medium mb-1 block">Cost ($)</label>
              <input
                type="number"
                step="0.5"
                value={vapeProfile.costPerPodOrBottle}
                onChange={(e) => updateVapeProfile({ costPerPodOrBottle: Number(e.target.value) })}
                className="w-full rounded-2xl bg-white/5 border border-[var(--border-subtle)] px-2.5 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent-purple)]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[var(--text-muted)] font-medium mb-1 block">Daily Target Limit (Puffs)</label>
            <input
              type="number"
              value={vapeProfile.dailyLimitGoal}
              onChange={(e) => updateVapeProfile({ dailyLimitGoal: Number(e.target.value) })}
              className="w-full rounded-2xl bg-white/5 border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent-purple)] font-bold text-[var(--accent-purple)]"
            />
          </div>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="glass-panel p-4 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-1.5">
          <Palette className="h-4 w-4 text-[var(--accent-pink)]" />
          Apple Theme Mode
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => updateSettings({ theme: t.id })}
              className={`p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between border ${
                settings.theme === t.id ? 'ring-2 ring-[var(--accent-purple)]' : 'opacity-80'
              } ${t.bg}`}
            >
              <span>{t.label}</span>
              {settings.theme === t.id && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Audio & Vapor FX */}
      <div className="glass-panel p-4 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-1.5">
          <Volume2 className="h-4 w-4 text-[var(--accent-green)]" />
          Feedback & Effects
        </h3>

        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 cursor-pointer">
            <span className="text-xs font-semibold text-[var(--text-main)]">Web Audio Synthesizer</span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              className="h-4 w-4 rounded accent-[var(--accent-purple)]"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 cursor-pointer">
            <span className="text-xs font-semibold text-[var(--text-main)]">Haptic Vibration</span>
            <input
              type="checkbox"
              checked={settings.hapticsEnabled}
              onChange={(e) => updateSettings({ hapticsEnabled: e.target.checked })}
              className="h-4 w-4 rounded accent-[var(--accent-purple)]"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 cursor-pointer">
            <span className="text-xs font-semibold text-[var(--text-main)]">Canvas Vapor Particles</span>
            <input
              type="checkbox"
              checked={settings.vaporEffectsEnabled}
              onChange={(e) => updateSettings({ vaporEffectsEnabled: e.target.checked })}
              className="h-4 w-4 rounded accent-[var(--accent-purple)]"
            />
          </label>
        </div>
      </div>

      {/* Backup & Reset */}
      <div className="glass-panel p-4 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-1.5">
          <Download className="h-4 w-4 text-sky-400" />
          Data Management
        </h3>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-white/5 text-xs font-semibold text-[var(--text-main)] hover:bg-white/10 transition-all"
          >
            {copySuccess ? <Check className="h-4 w-4 text-emerald-400" /> : <Download className="h-4 w-4" />}
            <span>{copySuccess ? 'Copied JSON!' : 'Export JSON'}</span>
          </button>

          <button
            onClick={() => setShowImportArea(!showImportArea)}
            className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-white/5 text-xs font-semibold text-[var(--text-main)] hover:bg-white/10 transition-all"
          >
            <Upload className="h-4 w-4" />
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
              className="w-full rounded-2xl bg-white/5 border border-[var(--border-subtle)] p-2 text-xs font-mono text-[var(--text-main)] outline-none"
            />
            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-[var(--accent-purple)] text-xs font-bold text-white shadow-md"
            >
              Apply Restore
            </button>
          </form>
        )}

        <div className="border-t border-white/10 pt-3 mt-1">
          <button
            onClick={() => {
              if (window.confirm('Reset all puff logs and local settings?')) {
                resetAllData();
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-red-500/10 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all"
          >
            <Trash2 className="h-4 w-4" />
            <span>Reset Local Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

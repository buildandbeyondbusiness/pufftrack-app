import React, { useState, useEffect } from 'react';
import { usePuff } from '../context/PuffContext';
import {
  RotateCcw,
  Sparkles,
  Droplets,
  Layers,
  AlertCircle
} from 'lucide-react';
import type { VapeDeviceType } from '../types';

export const ModelsView: React.FC = () => {
  const {
    vapeProfile,
    updateVapeProfile,
    podPuffsUsed,
    podPuffsRemaining,
    podPercentRemaining,
    estimatedDaysUntilRefill,
    resetCurrentPod,
    todayCount,
    addPuff,
  } = usePuff();

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(vapeProfile);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [wavePhase, setWavePhase] = useState(0);

  // Continuous gentle liquid wave oscillation
  useEffect(() => {
    let animId: number;
    const updateWave = () => {
      setWavePhase((prev) => (prev + (isPulling ? 0.12 : 0.04)) % (Math.PI * 2));
      animId = requestAnimationFrame(updateWave);
    };
    animId = requestAnimationFrame(updateWave);
    return () => cancelAnimationFrame(animId);
  }, [isPulling]);

  const deviceTypes: VapeDeviceType[] = ['Disposable', 'Pod System', 'Sub-Ohm Mod', 'Nic Salt Tank'];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateVapeProfile(tempProfile);
    setIsEditing(false);
  };

  const handleDevicePull = () => {
    setIsPulling(true);
    addPuff('Habit', 'Device Pull Test');
    setTimeout(() => setIsPulling(false), 900);
  };

  const isLowLiquid = podPercentRemaining < 20;

  // Generate dynamic fluid surface SVG path
  const waveHeight = isPulling ? 4.5 : 2.5;
  const liquidY = 100 - podPercentRemaining; // 0 (full) to 100 (empty)
  const p1Y = liquidY + Math.sin(wavePhase) * waveHeight;
  const p2Y = liquidY + Math.sin(wavePhase + Math.PI * 0.5) * waveHeight;
  const p3Y = liquidY + Math.sin(wavePhase + Math.PI) * waveHeight;
  const wavePath = `M 0 ${p1Y} Q 25 ${p2Y} 50 ${liquidY} T 100 ${p3Y} L 100 100 L 0 100 Z`;

  return (
    <div className="flex flex-col gap-5 px-4 pb-12 pt-1">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
            Device Model
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium">
            Active Vape Hardware & Estimated Refill
          </p>
        </div>

        <button
          onClick={() => {
            setTempProfile(vapeProfile);
            setIsEditing(!isEditing);
          }}
          className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[var(--bg-accent-pill)] text-[var(--accent-purple)] border border-[var(--border-subtle)] hover:bg-[var(--accent-purple-glow)] transition-all cursor-pointer"
        >
          {isEditing ? 'Cancel' : 'Edit Specs'}
        </button>
      </div>

      {/* Hero Vape Device Card with Interactive Animations */}
      <div className="glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Atmospheric Floating Ambient Glow */}
        <div
          className={`absolute h-56 w-56 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isPulling
              ? 'bg-indigo-400 opacity-60 scale-125'
              : isLowLiquid
              ? 'bg-amber-500 opacity-30'
              : 'bg-[var(--accent-purple)] opacity-30'
          }`}
        />

        <div className="relative flex flex-col items-center w-full">
          {/* Device Brand Header */}
          <div className="flex items-center justify-between w-full mb-3">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${isPulling ? 'bg-indigo-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {vapeProfile.deviceType}
              </span>
            </div>
            <div className="text-xs font-bold text-[var(--accent-purple)] bg-[var(--bg-accent-pill)] px-2.5 py-0.5 rounded-full border border-[var(--border-subtle)] shadow-sm">
              {vapeProfile.nicotineMgPerMl} mg/ml Nic
            </div>
          </div>

          {/* Interactive Tap-to-Vape Device Area */}
          <div
            onClick={handleDevicePull}
            title="Tap device to take an animated test hit!"
            className="relative my-2 flex flex-col items-center cursor-pointer group select-none transition-transform duration-200 active:scale-95"
          >
            {/* Animated Mouthpiece Vapor Wisps (Shown on pull) */}
            <div className={`absolute -top-7 inset-x-0 flex justify-center pointer-events-none transition-opacity duration-300 ${isPulling ? 'opacity-100' : 'opacity-0'}`}>
              <div className="relative flex items-center justify-center">
                <span className="h-6 w-6 rounded-full bg-cyan-300 blur-md animate-ping opacity-80" />
                <span className="absolute -top-2 h-4 w-4 rounded-full bg-white blur-sm animate-bounce opacity-90" />
              </div>
            </div>

            {/* Mouthpiece */}
            <div className={`w-12 h-6 rounded-t-xl border-t border-x border-white/20 transition-all duration-300 shadow-inner ${
              isPulling ? 'bg-zinc-700 shadow-[0_0_12px_rgba(56,189,248,0.6)]' : 'bg-zinc-800'
            }`} />

            {/* Device Body Chassis */}
            <div className={`relative w-40 h-56 rounded-2xl bg-gradient-to-b from-zinc-800 via-zinc-900 to-black border transition-all duration-300 shadow-2xl overflow-hidden p-3.5 flex flex-col justify-between items-center ${
              isPulling
                ? 'border-cyan-400 ring-4 ring-cyan-500/25 shadow-cyan-500/30'
                : 'border-white/20 hover:border-white/40'
            }`}>
              {/* Glass Juice Window / Fluid Physics Simulation */}
              <div className="relative w-full h-24 rounded-xl bg-black/75 border border-white/15 overflow-hidden flex flex-col justify-end shadow-inner">
                {/* SVG Liquid Wave with animated surface */}
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="w-full h-full absolute inset-0"
                >
                  <defs>
                    <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop
                        offset="0%"
                        stopColor={isPulling ? '#38bdf8' : isLowLiquid ? '#f59e0b' : '#0a84ff'}
                        stopOpacity={0.85}
                      />
                      <stop
                        offset="100%"
                        stopColor={isPulling ? '#6366f1' : isLowLiquid ? '#b45309' : '#0055ff'}
                        stopOpacity={0.95}
                      />
                    </linearGradient>
                  </defs>
                  <path d={wavePath} fill="url(#liquidGrad)" />
                </svg>

                {/* Animated Rising Micro-Bubbles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <span className="absolute bottom-2 left-4 h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDuration: '1.8s' }} />
                  <span className="absolute bottom-1 right-6 h-1 w-1 rounded-full bg-white/50 animate-bounce" style={{ animationDuration: '2.4s' }} />
                  <span className="absolute bottom-3 left-10 h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDuration: '1.5s' }} />
                </div>

                {/* Glass Light Reflection Sheen */}
                <div className="absolute inset-x-0 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 pointer-events-none" />

                {/* Liquid Level Indicator Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xs font-black text-white tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {podPercentRemaining}% Liquid
                  </span>
                </div>
              </div>

              {/* Device Brand Emboss */}
              <div className="flex flex-col items-center my-1">
                <span className="text-sm font-black tracking-widest text-white uppercase drop-shadow-sm">
                  {vapeProfile.deviceName.split(' ')[0] || 'ELFBAR'}
                </span>
                <span className="text-[9px] font-semibold text-zinc-400 tracking-wider">
                  {vapeProfile.deviceName.split(' ').slice(1).join(' ') || '5000'}
                </span>
              </div>

              {/* Bottom LED Indicator with Ambient Flare */}
              <div className="w-full flex items-center justify-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    isPulling
                      ? 'bg-cyan-300 shadow-[0_0_12px_#38bdf8] scale-150 animate-ping'
                      : isLowLiquid
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  }`}
                />
                <span className="text-[9px] font-extrabold text-zinc-300 tracking-wider">
                  {isPulling ? 'FIRING COIL...' : 'STATUS READY'}
                </span>
              </div>
            </div>

            <span className="text-[10px] text-zinc-500 font-medium mt-2 flex items-center gap-1 group-hover:text-zinc-300 transition-colors">
              <Sparkles className="h-3 w-3 text-[var(--accent-purple)]" />
              Tap device to test puff animation
            </span>
          </div>

          {/* Estimated Refill & Pod Life Stats Banner (From Sketch) */}
          <div className="w-full mt-3 rounded-2xl bg-white/5 p-3.5 border border-[var(--border-subtle)] flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all ${
                  isLowLiquid ? 'bg-amber-500/20 text-amber-400' : 'bg-[var(--bg-accent-pill)] text-[var(--accent-purple)]'
                }`}
              >
                <Droplets className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-[var(--text-main)] flex items-center gap-1.5">
                  <span>Estimated Refill</span>
                  {isLowLiquid ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                      Low E-Juice
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      Good
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
                  ~<strong className="text-[var(--text-main)]">{estimatedDaysUntilRefill} days</strong> remaining ({podPuffsRemaining} puffs)
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowResetConfirm(true)}
              title="Replace Pod / Reset Counter"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[var(--text-main)] text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>New Pod</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Pod Confirmation Prompt */}
      {showResetConfirm && (
        <div className="glass-panel p-4 border border-amber-500/30 bg-amber-500/10 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs text-amber-200 font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Installed a fresh pod/disposable? Reset counter to 100%?</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                resetCurrentPod();
                setShowResetConfirm(false);
              }}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-black shadow-md cursor-pointer hover:bg-amber-400"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Device Specifications Card (Sketch "Device" block) */}
      <div className="glass-panel p-4 flex flex-col gap-3">
        <h3 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-[var(--accent-purple)]" />
          Hardware Configuration
        </h3>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[var(--text-muted)] mb-1 block">Device Model Name</label>
              <input
                type="text"
                value={tempProfile.deviceName}
                onChange={(e) => setTempProfile({ ...tempProfile, deviceName: e.target.value })}
                className="w-full rounded-xl bg-white/5 border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent-purple)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-[var(--text-muted)] mb-1 block">Device Type</label>
                <select
                  value={tempProfile.deviceType}
                  onChange={(e) => setTempProfile({ ...tempProfile, deviceType: e.target.value as VapeDeviceType })}
                  className="w-full rounded-xl bg-white/5 border border-[var(--border-subtle)] px-2.5 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent-purple)]"
                >
                  {deviceTypes.map((t) => (
                    <option key={t} value={t} className="bg-[#12121c] text-white">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[var(--text-muted)] mb-1 block">Nicotine (mg/ml)</label>
                <input
                  type="number"
                  step="0.5"
                  value={tempProfile.nicotineMgPerMl}
                  onChange={(e) => setTempProfile({ ...tempProfile, nicotineMgPerMl: Number(e.target.value) })}
                  className="w-full rounded-xl bg-white/5 border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent-purple)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-[var(--text-muted)] mb-1 block">Pod (mL)</label>
                <input
                  type="number"
                  step="0.5"
                  value={tempProfile.podCapacityMl}
                  onChange={(e) => setTempProfile({ ...tempProfile, podCapacityMl: Number(e.target.value) })}
                  className="w-full rounded-xl bg-white/5 border border-[var(--border-subtle)] px-2.5 py-2 text-xs text-[var(--text-main)] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[var(--text-muted)] mb-1 block">Total Puffs</label>
                <input
                  type="number"
                  value={tempProfile.totalPuffsPerPod}
                  onChange={(e) => setTempProfile({ ...tempProfile, totalPuffsPerPod: Number(e.target.value) })}
                  className="w-full rounded-xl bg-white/5 border border-[var(--border-subtle)] px-2.5 py-2 text-xs text-[var(--text-main)] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[var(--text-muted)] mb-1 block">Cost ($)</label>
                <input
                  type="number"
                  step="0.5"
                  value={tempProfile.costPerPodOrBottle}
                  onChange={(e) => setTempProfile({ ...tempProfile, costPerPodOrBottle: Number(e.target.value) })}
                  className="w-full rounded-xl bg-white/5 border border-[var(--border-subtle)] px-2.5 py-2 text-xs text-[var(--text-main)] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[var(--text-muted)] mb-1 block">Daily Target Limit</label>
              <input
                type="number"
                value={tempProfile.dailyLimitGoal}
                onChange={(e) => setTempProfile({ ...tempProfile, dailyLimitGoal: Number(e.target.value) })}
                className="w-full rounded-xl bg-white/5 border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-main)] font-bold text-[var(--accent-purple)] outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--accent-purple)] text-white shadow-lg cursor-pointer"
              >
                Save Specs
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-2xl bg-white/5 p-3 border border-[var(--border-subtle)]">
              <div className="text-[10px] text-[var(--text-muted)] font-medium">Pod Capacity</div>
              <div className="text-base font-bold text-[var(--text-main)] mt-0.5">
                {vapeProfile.podCapacityMl} mL <span className="text-[10px] text-zinc-400 font-normal">({vapeProfile.totalPuffsPerPod} puffs)</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 p-3 border border-[var(--border-subtle)]">
              <div className="text-[10px] text-[var(--text-muted)] font-medium">Strength Rate</div>
              <div className="text-base font-bold text-[var(--accent-purple)] mt-0.5">
                {vapeProfile.nicotineMgPerMl} mg/mL
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 p-3 border border-[var(--border-subtle)]">
              <div className="text-[10px] text-[var(--text-muted)] font-medium">Pod Replacement Cost</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                ${vapeProfile.costPerPodOrBottle.toFixed(2)}
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 p-3 border border-[var(--border-subtle)]">
              <div className="text-[10px] text-[var(--text-muted)] font-medium">Daily Limit Goal</div>
              <div className="text-base font-bold text-indigo-400 mt-0.5">
                {vapeProfile.dailyLimitGoal} hits/day
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pod Analytics & Lifespan Highlights */}
      <div className="glass-panel p-4 flex flex-col gap-3">
        <h3 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[var(--accent-cyan)]" />
          Lifespan & Usage Breakdown
        </h3>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">Puffs Logged on Pod</span>
            <span className="font-bold text-[var(--text-main)]">{podPuffsUsed} / {vapeProfile.totalPuffsPerPod}</span>
          </div>

          {/* Apple Animated Shimmer Progress Bar */}
          <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
              style={{
                width: `${100 - podPercentRemaining}%`,
                backgroundColor: isLowLiquid ? '#f59e0b' : 'var(--accent-purple)',
              }}
            >
              {/* Shimmer light sweep across the bar */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1">
            <span>Today logged: <strong className="text-[var(--text-main)]">{todayCount} hits</strong></span>
            <span>Est. pod cost/puff: <strong className="text-emerald-400">${(vapeProfile.costPerPodOrBottle / Math.max(1, vapeProfile.totalPuffsPerPod)).toFixed(3)}</strong></span>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Clearance */}
      <div className="h-16 w-full shrink-0" />
    </div>
  );
};

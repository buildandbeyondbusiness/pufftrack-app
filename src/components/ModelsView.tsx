import React, { useState } from 'react';
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
  } = usePuff();

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(vapeProfile);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const deviceTypes: VapeDeviceType[] = ['Disposable', 'Pod System', 'Sub-Ohm Mod', 'Nic Salt Tank'];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateVapeProfile(tempProfile);
    setIsEditing(false);
  };

  const isLowLiquid = podPercentRemaining < 20;

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

      {/* Hero Vape Device Graphic Card (Matching Sketch Top "Elfbar" illustration & Estimated Refill) */}
      <div className="glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div
          className={`absolute h-48 w-48 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-500 ${
            isLowLiquid ? 'bg-amber-500' : 'bg-[var(--accent-purple)]'
          }`}
        />

        <div className="relative flex flex-col items-center w-full">
          {/* Device Brand Header */}
          <div className="flex items-center justify-between w-full mb-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {vapeProfile.deviceType}
              </span>
            </div>
            <div className="text-xs font-bold text-[var(--accent-purple)] bg-[var(--bg-accent-pill)] px-2.5 py-0.5 rounded-full border border-[var(--border-subtle)]">
              {vapeProfile.nicotineMgPerMl} mg/ml Nic
            </div>
          </div>

          {/* Stylized Modern Vape Device Vector / CSS Illustration */}
          <div className="relative my-2 flex flex-col items-center">
            {/* Mouthpiece */}
            <div className="w-12 h-6 bg-zinc-800 rounded-t-xl border-t border-x border-white/20 shadow-inner" />

            {/* Device Body */}
            <div className="relative w-36 h-52 rounded-2xl bg-gradient-to-b from-zinc-800 via-zinc-900 to-black border border-white/20 shadow-2xl overflow-hidden p-3 flex flex-col justify-between items-center">
              {/* Glass Juice Window / Fill level */}
              <div className="relative w-full h-24 rounded-xl bg-black/60 border border-white/10 overflow-hidden flex flex-col justify-end">
                {/* Liquid Level Animation */}
                <div
                  className="w-full transition-all duration-1000 ease-out relative"
                  style={{
                    height: `${podPercentRemaining}%`,
                    background: isLowLiquid
                      ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.7) 0%, rgba(217, 119, 6, 0.9) 100%)'
                      : 'linear-gradient(180deg, rgba(10, 132, 255, 0.7) 0%, rgba(99, 102, 241, 0.9) 100%)',
                  }}
                >
                  {/* Liquid surface wave ripple */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-white/40 blur-[0.5px]" />
                </div>

                {/* Liquid Level Indicator Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xs font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
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
                  {vapeProfile.deviceName.split(' ').slice(1).join(' ') || 'PRO SERIE'}
                </span>
              </div>

              {/* Bottom LED Indicator */}
              <div className="w-full flex items-center justify-center gap-1">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isLowLiquid ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  }`}
                />
                <span className="text-[9px] font-bold text-zinc-400">STATUS READY</span>
              </div>
            </div>
          </div>

          {/* Estimated Refill & Pod Life Stats Banner (From Sketch) */}
          <div className="w-full mt-4 rounded-2xl bg-white/5 p-3.5 border border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                  isLowLiquid ? 'bg-amber-500/20 text-amber-400' : 'bg-[var(--bg-accent-pill)] text-[var(--accent-purple)]'
                }`}
              >
                <Droplets className="h-5 w-5" />
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

          {/* Apple Progress Bar */}
          <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${100 - podPercentRemaining}%`,
                backgroundColor: isLowLiquid ? '#f59e0b' : 'var(--accent-purple)',
              }}
            />
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

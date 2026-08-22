import React, { useState } from 'react';
import { usePuff } from '../context/PuffContext';
import {
  Plus,
  Minus,
  Clock,
  User,
  Activity,
  ChevronRight,
  X,
  AlertTriangle
} from 'lucide-react';
import type { MoodTag } from '../types';
import {
  NicotineMoleculeIcon,
  SessionTimerIcon,
  SparkHitIcon
} from './icons/AppIcons';

interface DailyPuffsViewProps {
  onTriggerVapor: (e?: React.MouseEvent) => void;
  onOpenProfile: () => void;
}

export const DailyPuffsView: React.FC<DailyPuffsViewProps> = ({ onTriggerVapor, onOpenProfile }) => {
  const {
    todayCount,
    currentLimit,
    todayNicotineMg,
    todaySessionsCount,
    todayVapingTimeSeconds,
    timeSinceLastPuffSeconds,
    vapeProfile,
    addPuff,
    undoLastPuff,
    addMultiplePuffs,
    todayPuffs,
    user,
    isCloudSyncing,
    averageBreakMinutes,
    todayCost,
    nicotinePerPuffMg,
    isLiveSessionRunning,
    liveSessionSeconds,
    liveSessionPuffs,
    startLiveSession,
    stopLiveSession,
  } = usePuff();

  const [selectedMood, setSelectedMood] = useState<MoodTag | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState<boolean>(false);
  const [showQuickHitFlyout, setShowQuickHitFlyout] = useState<boolean>(false);
  const [showNicSheet, setShowNicSheet] = useState<boolean>(false);
  const [showSessionModal, setShowSessionModal] = useState<boolean>(false);
  const [isPuffing, setIsPuffing] = useState<boolean>(false);
  const [isAuraBlooming, setIsAuraBlooming] = useState<boolean>(false);

  // Format Time Since Last Puff
  const formatTimeSinceLastHit = (totalSeconds: number) => {
    if (todayPuffs.length === 0) return 'None yet';
    if (totalSeconds < 60) return 'Just now';
    const mins = Math.floor(totalSeconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  // Format Vaping Duration Today
  const formatVapingDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const isOverLimit = todayCount >= currentLimit;

  // Orchestrated Apple-esque Puff Sequence
  const handlePuffClick = (e: React.MouseEvent) => {
    // Stage 1: Inhale / Ignition Compression
    setIsPuffing(true);
    setIsAuraBlooming(true);

    // Stage 2: Volumetric Vapor Plume Eruption
    onTriggerVapor(e);
    addPuff(selectedMood || undefined);

    // Stage 3: Spring Release
    setTimeout(() => setIsPuffing(false), 250);
    setTimeout(() => setIsAuraBlooming(false), 1200);
  };

  const handleQuickAdd = (count: number) => {
    setIsPuffing(true);
    setIsAuraBlooming(true);
    addMultiplePuffs(count);
    onTriggerVapor();
    setShowQuickHitFlyout(false);
    setTimeout(() => setIsPuffing(false), 250);
    setTimeout(() => setIsAuraBlooming(false), 1200);
  };

  // Sunburst / Radiant notch ticks generation for the SVG radial meter
  const TOTAL_TICKS = 40;
  const activeTicksCount = Math.min(TOTAL_TICKS, Math.round((todayCount / Math.max(1, currentLimit)) * TOTAL_TICKS));
  const moodList: MoodTag[] = ['Morning', 'Stress', 'Habit', 'Social', 'Post Meal', 'Boredom', 'Craving'];

  return (
    <div className="flex flex-col gap-5 px-4 pb-12 pt-1 relative">
      {/* Top Header with Profile / Settings Button (Matching Sketch "Profile also opens settings") */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
            Today
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </div>

        {/* Profile & Settings Trigger */}
        <button
          onClick={onOpenProfile}
          title="Profile & Settings"
          className="flex items-center gap-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] p-1.5 pr-3 shadow-lg hover:border-[var(--accent-purple)] transition-all cursor-pointer group active:scale-95"
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="h-7 w-7 rounded-full border border-[var(--accent-purple)]"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-accent-pill)] text-[var(--accent-purple)]">
              <User className="h-4 w-4" />
            </div>
          )}
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold text-[var(--text-main)] max-w-[80px] truncate">
              {user?.displayName?.split(' ')[0] || 'Account'}
            </span>
            <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${user ? (isCloudSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400') : 'bg-zinc-500'}`} />
              Settings
            </span>
          </div>
        </button>
      </div>

      {/* Apple Fitness 3 Nested Activity Rings Summary */}
      <div className={`glass-panel p-4 flex items-center justify-between transition-all duration-500 ${
        isAuraBlooming ? 'border-[var(--accent-purple)] shadow-[0_0_20px_var(--accent-purple-glow)]' : ''
      }`}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-pink)]" />
            <span className="text-xs font-semibold text-[var(--text-main)]">{todayCount} / {currentLimit} Puffs</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-green)]" />
            <span className="text-xs font-semibold text-[var(--text-main)]">{todayNicotineMg} mg Nicotine</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-cyan)]" />
            <span className="text-xs font-semibold text-[var(--text-main)]">{todaySessionsCount} Sessions ({formatVapingDuration(todayVapingTimeSeconds)})</span>
          </div>
        </div>

        {/* 3 Activity Rings */}
        <div className="relative flex items-center justify-center h-20 w-20">
          <svg className="h-20 w-20 transform -rotate-90">
            {/* Outer Pink (Puffs) */}
            <circle cx="40" cy="40" r="34" stroke="rgba(255, 55, 95, 0.18)" strokeWidth="5.5" fill="transparent" />
            <circle
              cx="40"
              cy="40"
              r="34"
              stroke="#ff375f"
              strokeWidth="5.5"
              strokeDasharray={2 * Math.PI * 34}
              strokeDashoffset={(2 * Math.PI * 34) * (1 - Math.min(1, todayCount / Math.max(1, currentLimit)))}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />

            {/* Middle Green (Nicotine) */}
            <circle cx="40" cy="40" r="25" stroke="rgba(48, 209, 88, 0.18)" strokeWidth="5.5" fill="transparent" />
            <circle
              cx="40"
              cy="40"
              r="25"
              stroke="#30d158"
              strokeWidth="5.5"
              strokeDasharray={2 * Math.PI * 25}
              strokeDashoffset={(2 * Math.PI * 25) * (1 - Math.min(1, todayNicotineMg / 25))}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />

            {/* Inner Cyan (Sessions) */}
            <circle cx="40" cy="40" r="16" stroke="rgba(100, 210, 255, 0.18)" strokeWidth="5.5" fill="transparent" />
            <circle
              cx="40"
              cy="40"
              r="16"
              stroke="#64d2ff"
              strokeWidth="5.5"
              strokeDasharray={2 * Math.PI * 16}
              strokeDashoffset={(2 * Math.PI * 16) * (1 - Math.min(1, todaySessionsCount / 8))}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
        </div>
      </div>

      {/* Main Radiant Sunburst Gauge with Animated Puff Sequence */}
      <div className={`glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${
        isAuraBlooming ? 'ring-2 ring-cyan-400/40 shadow-2xl shadow-cyan-500/20' : ''
      }`}>
        {/* Dynamic Atmospheric Light Bloom Aura */}
        <div
          className={`absolute h-56 w-56 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isAuraBlooming
              ? 'bg-cyan-400 opacity-60 scale-125'
              : isOverLimit
              ? 'bg-red-600 opacity-40'
              : 'bg-[var(--accent-purple)] opacity-25'
          }`}
        />

        <div className={`relative flex items-center justify-center h-64 w-64 transition-transform duration-300 ${
          isPuffing ? 'scale-95' : 'scale-100'
        }`}>
          {/* Sunburst radiant rays SVG with firing animation */}
          <svg className="h-full w-full transform rotate-135" viewBox="0 0 200 200">
            {Array.from({ length: TOTAL_TICKS }).map((_, index) => {
              const angle = (index / (TOTAL_TICKS - 1)) * 270;
              const angleRad = (angle * Math.PI) / 180;
              const isActive = index < activeTicksCount;

              const innerR = 72;
              const outerR = isActive && isAuraBlooming ? 92 : 88;
              const cx = 100;
              const cy = 100;

              const x1 = cx + innerR * Math.cos(angleRad);
              const y1 = cy + innerR * Math.sin(angleRad);
              const x2 = cx + outerR * Math.cos(angleRad);
              const y2 = cy + outerR * Math.sin(angleRad);

              return (
                <line
                  key={index}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={
                    isActive
                      ? isOverLimit
                        ? '#ff453a'
                        : isAuraBlooming
                        ? '#38bdf8'
                        : 'var(--accent-purple)'
                      : 'rgba(255,255,255,0.12)'
                  }
                  strokeWidth={isActive ? (isAuraBlooming ? '4.5' : '3.5') : '1.8'}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>

          {/* Central Radial Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Puffs today
            </span>

            <div className="my-1 flex items-baseline justify-center gap-1">
              <span
                className={`text-5xl font-black tracking-tight transition-all duration-300 ${
                  isAuraBlooming
                    ? 'text-cyan-300 scale-110 drop-shadow-[0_0_15px_#38bdf8]'
                    : isOverLimit
                    ? 'text-red-500 animate-pulse'
                    : 'text-[var(--text-main)]'
                }`}
              >
                {todayCount}
              </span>
              <span className="text-xl font-bold text-[var(--text-muted)]">
                /{currentLimit}
              </span>
            </div>

            {/* Last Hit Pill Badge (Directly from Sketch) */}
            {isOverLimit ? (
              <div className="flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400 border border-red-500/30">
                <AlertTriangle className="h-3 w-3" />
                <span>Over Limit</span>
              </div>
            ) : (
              <div className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all duration-500 flex items-center gap-1.5 shadow-sm ${
                isAuraBlooming
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 scale-105'
                  : 'bg-[var(--bg-accent-pill)] border-[var(--border-subtle)] text-[var(--text-muted)]'
              }`}>
                <Clock className="h-3 w-3 text-[var(--accent-purple)]" />
                <span>Last Hit:</span>
                <span className="text-[var(--text-main)] font-bold">
                  {formatTimeSinceLastHit(timeSinceLastPuffSeconds)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Trigger Mood Tag selector */}
        <div className="mt-1 w-full flex flex-col items-center">
          <button
            onClick={() => setShowMoodSelector(!showMoodSelector)}
            className="text-xs text-[var(--accent-purple)] hover:underline font-semibold cursor-pointer"
          >
            {selectedMood ? `Mood: ${selectedMood} (Tap to change)` : '+ Tag Mood / Trigger'}
          </button>

          {showMoodSelector && (
            <div className="flex flex-wrap gap-1.5 justify-center py-2 px-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] w-full transition-all mt-2">
              {moodList.map((mood) => (
                <button
                  key={mood}
                  onClick={() => {
                    setSelectedMood(selectedMood === mood ? null : mood);
                    setShowMoodSelector(false);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-xl font-semibold transition-all cursor-pointer ${
                    selectedMood === mood
                      ? 'bg-[var(--accent-purple)] text-white shadow-md'
                      : 'bg-white/5 text-[var(--text-muted)] hover:bg-white/10'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Control Hub (Matching Sketch: Left Quick Hit Flyout, Center '+', Left 'Nic', Right 'Session') */}
      <div className="flex items-center gap-3 w-full">
        {/* Nic Button (Left Pill with Custom Molecular Hex Icon) */}
        <button
          onClick={() => setShowNicSheet(true)}
          className="flex-1 flex flex-col items-center justify-center py-3 rounded-2xl glass-panel text-[var(--text-main)] hover:border-[var(--accent-purple)] active:scale-95 transition-all cursor-pointer shadow-md group"
        >
          <div className="flex items-center gap-1 text-xs font-extrabold text-[var(--accent-purple)]">
            <NicotineMoleculeIcon className="h-4 w-4 drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]" />
            <span>Nic</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">{todayNicotineMg} mg</span>
        </button>

        {/* Primary '+' Puff Button (Center Round/Pill Button from Sketch) */}
        <button
          onClick={handlePuffClick}
          className={`flex-[1.8] flex items-center justify-center gap-2 py-4 rounded-3xl font-black text-xl shadow-2xl transition-all duration-300 active:scale-90 cursor-pointer ${
            isPuffing ? 'scale-90 ring-4 ring-cyan-400' : ''
          }`}
          style={{
            background: isOverLimit
              ? 'linear-gradient(135deg, #ff453a 0%, #ff3b30 100%)'
              : 'linear-gradient(135deg, #0a84ff 0%, #007aff 100%)',
            boxShadow: isAuraBlooming
              ? '0 0 35px rgba(56, 189, 248, 0.7)'
              : '0 12px 35px -5px rgba(10, 132, 255, 0.5)',
            color: '#ffffff',
          }}
        >
          <Plus className={`h-7 w-7 stroke-[3.5] transition-transform duration-300 ${isPuffing ? 'rotate-90 scale-125' : ''}`} />
          <span>PUFF</span>
        </button>

        {/* Session Button (Right Pill with Custom Chronometer Icon) */}
        <button
          onClick={() => setShowSessionModal(true)}
          className={`flex-1 flex flex-col items-center justify-center py-3 rounded-2xl glass-panel text-[var(--text-main)] hover:border-emerald-500 active:scale-95 transition-all cursor-pointer shadow-md ${
            isLiveSessionRunning ? 'ring-2 ring-emerald-400 bg-emerald-500/10' : ''
          }`}
        >
          <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-400">
            <SessionTimerIcon className="h-4 w-4 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            <span>Session</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">
            {isLiveSessionRunning ? `${Math.floor(liveSessionSeconds / 60)}m ${liveSessionSeconds % 60}s` : 'Timed'}
          </span>
        </button>
      </div>

      {/* Undo & Quick Hit Flyout Drawer Toggle (Left Side Quick Hit Menu with Spark Icon) */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setShowQuickHitFlyout(!showQuickHitFlyout)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl glass-panel text-xs font-bold text-[var(--text-main)] hover:border-amber-400 transition-all cursor-pointer active:scale-95 shadow-md"
        >
          <SparkHitIcon className="h-4 w-4 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
          <span>Quick Hit Menu</span>
          <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${showQuickHitFlyout ? 'rotate-90' : ''}`} />
        </button>

        <button
          onClick={undoLastPuff}
          title="Undo last hit"
          className="flex items-center gap-1 px-3.5 py-2 rounded-2xl glass-panel text-xs font-semibold text-[var(--text-muted)] hover:text-red-400 transition-all cursor-pointer active:scale-95 shadow-md"
        >
          <Minus className="h-3.5 w-3.5" />
          <span>Undo Hit</span>
        </button>
      </div>

      {/* Slide-out Quick Hit Drawer (Matching Sketch Quick Hit: +1, +3, +5, +10) */}
      {showQuickHitFlyout && (
        <div className="glass-panel p-4 border border-amber-500/40 bg-[var(--bg-card)] rounded-2xl flex flex-col gap-3 animate-in slide-in-from-left-4 duration-200">
          <div className="flex items-center justify-between text-xs font-extrabold text-[var(--text-main)]">
            <span className="flex items-center gap-1.5 text-amber-300">
              <SparkHitIcon className="h-4 w-4" />
              Quick Hit Multi-Puff Presets
            </span>
            <button
              onClick={() => setShowQuickHitFlyout(false)}
              className="text-[var(--text-muted)] hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[1, 3, 5, 10].map((num) => (
              <button
                key={num}
                onClick={() => handleQuickAdd(num)}
                className="py-3 rounded-xl bg-white/5 hover:bg-amber-500 hover:text-black border border-[var(--border-subtle)] text-xs font-black text-[var(--text-main)] transition-all cursor-pointer active:scale-95 shadow-md flex flex-col items-center justify-center gap-0.5"
              >
                <span className="text-base font-black">+{num}</span>
                <span className="text-[9px] opacity-75 font-normal">hits</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Apple Health Widget: Session Pace & Cost Highlights */}
      <div className="glass-panel p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5 text-[var(--accent-purple)]">
            <Activity className="h-3.5 w-3.5" />
            Daily Habit Pacing
          </span>
          <span className="text-emerald-400 font-bold">
            {averageBreakMinutes > 0 ? `${averageBreakMinutes}m avg pause` : 'Active'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/5 p-3 border border-[var(--border-subtle)]">
            <div className="text-[10px] text-[var(--text-muted)] font-medium">Daily Cost Spent</div>
            <div className="text-lg font-bold text-[var(--text-main)] mt-0.5">₹{todayCost}</div>
          </div>
          <div className="rounded-2xl bg-white/5 p-3 border border-[var(--border-subtle)]">
            <div className="text-[10px] text-[var(--text-muted)] font-medium">Avg Hit Interval</div>
            <div className="text-lg font-bold text-indigo-400 mt-0.5">
              {averageBreakMinutes > 0 ? `${averageBreakMinutes} min` : 'Continuous'}
            </div>
          </div>
        </div>
      </div>

      {/* Nic Quick Info Sheet Modal */}
      {showNicSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="glass-panel p-6 w-full max-w-sm flex flex-col gap-4 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[var(--text-main)] flex items-center gap-2">
                <NicotineMoleculeIcon className="h-6 w-6" />
                <span>Nicotine Intake Rate</span>
              </h3>
              <button
                onClick={() => setShowNicSheet(false)}
                className="p-1 rounded-full text-[var(--text-muted)] hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs text-[var(--text-muted)]">
              <div className="rounded-xl bg-white/5 p-3 border border-[var(--border-subtle)] flex items-center justify-between">
                <span>Concentration</span>
                <strong className="text-[var(--text-main)]">{vapeProfile.nicotineMgPerMl} mg/mL ({((vapeProfile.nicotineMgPerMl / 1000) * 100).toFixed(1)}%)</strong>
              </div>

              <div className="rounded-xl bg-white/5 p-3 border border-[var(--border-subtle)] flex items-center justify-between">
                <span>Estimated per Puff</span>
                <strong className="text-[var(--accent-purple)] font-bold">~{nicotinePerPuffMg.toFixed(2)} mg</strong>
              </div>

              <div className="rounded-xl bg-white/5 p-3 border border-[var(--border-subtle)] flex items-center justify-between">
                <span>Total Absorbed Today</span>
                <strong className="text-emerald-400 font-bold">{todayNicotineMg} mg</strong>
              </div>

              <p className="text-[11px] leading-relaxed pt-1">
                Based on your {vapeProfile.deviceName} ({vapeProfile.podCapacityMl}mL / {vapeProfile.totalPuffsPerPod} puffs). You can calibrate these specs anytime in the <strong>Models</strong> tab.
              </p>
            </div>

            <button
              onClick={() => setShowNicSheet(false)}
              className="w-full py-2.5 rounded-xl bg-[var(--accent-purple)] text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Session Mode Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="glass-panel p-6 w-full max-w-sm flex flex-col gap-4 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[var(--text-main)] flex items-center gap-2">
                <SessionTimerIcon className="h-6 w-6" />
                <span>Timed Vape Session</span>
              </h3>
              <button
                onClick={() => setShowSessionModal(false)}
                className="p-1 rounded-full text-[var(--text-muted)] hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-[var(--border-subtle)] gap-2">
              <span className="text-3xl font-mono font-black text-emerald-400">
                {Math.floor(liveSessionSeconds / 60).toString().padStart(2, '0')}:{(liveSessionSeconds % 60).toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-semibold">
                {liveSessionPuffs} hits taken during this session
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {isLiveSessionRunning ? (
                <button
                  onClick={() => {
                    stopLiveSession();
                    setShowSessionModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs cursor-pointer hover:bg-red-500/30"
                >
                  End Session
                </button>
              ) : (
                <button
                  onClick={() => {
                    startLiveSession();
                    setShowSessionModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md cursor-pointer hover:bg-emerald-500"
                >
                  Start New Session
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Scroll Spacer */}
      <div className="h-16 w-full shrink-0" />
    </div>
  );
};

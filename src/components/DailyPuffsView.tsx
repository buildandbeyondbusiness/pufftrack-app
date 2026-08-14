import React, { useState } from 'react';
import { usePuff } from '../context/PuffContext';
import { Plus, Minus, Flame, AlertTriangle } from 'lucide-react';
import type { MoodTag } from '../types';

interface DailyPuffsViewProps {
  onTriggerVapor: (e?: React.MouseEvent) => void;
}

export const DailyPuffsView: React.FC<DailyPuffsViewProps> = ({ onTriggerVapor }) => {
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
  } = usePuff();

  const [selectedMood, setSelectedMood] = useState<MoodTag | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState<boolean>(false);
  const [isPuffing, setIsPuffing] = useState<boolean>(false);

  // Format Time Since Last Puff
  const formatTimeSinceLastHit = (totalSeconds: number) => {
    if (todayPuffs.length === 0) return 'No hits today yet';
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

  const isOverLimit = todayCount > currentLimit;

  const handlePuffClick = (e: React.MouseEvent) => {
    setIsPuffing(true);
    setTimeout(() => setIsPuffing(false), 400);

    onTriggerVapor(e);
    addPuff(selectedMood || undefined);
  };

  // Notch ticks generation for the SVG radial meter
  const TOTAL_TICKS = 42;
  const activeTicksCount = Math.min(TOTAL_TICKS, Math.round((todayCount / Math.max(1, currentLimit)) * TOTAL_TICKS));

  const moodList: MoodTag[] = ['Morning', 'Stress', 'Habit', 'Social', 'Post Meal', 'Boredom', 'Craving'];

  return (
    <div className="flex flex-col gap-5 px-4 pb-20 pt-4">
      {/* Apple Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
            Today
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </div>

        {/* User Avatar & Cloud Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-[var(--bg-card)] px-3 py-1 text-xs font-semibold border border-[var(--border-subtle)] text-[var(--text-main)] shadow-sm">
            {user ? (
              <>
                <span className={`h-2 w-2 rounded-full ${isCloudSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                <span className="font-bold text-xs max-w-[90px] truncate">{user.displayName?.split(' ')[0] || 'Cloud'}</span>
              </>
            ) : (
              <>
                <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span>{vapeProfile.deviceName.split(' ')[0]}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Apple Fitness Style 3 Activity Rings & Quick Metrics */}
      <div className="glass-panel p-4 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[var(--accent-pink)]" />
            <span className="text-xs font-semibold text-[var(--text-main)]">{todayCount} / {currentLimit} Puffs</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[var(--accent-green)]" />
            <span className="text-xs font-semibold text-[var(--text-main)]">{todayNicotineMg} mg Nicotine</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[var(--accent-cyan)]" />
            <span className="text-xs font-semibold text-[var(--text-main)]">{todaySessionsCount} Sessions ({formatVapingDuration(todayVapingTimeSeconds)})</span>
          </div>
        </div>

        {/* Apple 3 Nesting Rings SVG */}
        <div className="relative flex items-center justify-center h-20 w-20">
          <svg className="h-20 w-20 transform -rotate-90">
            {/* Outer Pink Ring (Puffs) */}
            <circle cx="40" cy="40" r="34" stroke="rgba(255, 55, 95, 0.2)" strokeWidth="6" fill="transparent" />
            <circle
              cx="40"
              cy="40"
              r="34"
              stroke="#ff375f"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 34}
              strokeDashoffset={(2 * Math.PI * 34) * (1 - Math.min(1, todayCount / Math.max(1, currentLimit)))}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500"
            />

            {/* Middle Green Ring (Nicotine) */}
            <circle cx="40" cy="40" r="25" stroke="rgba(48, 209, 88, 0.2)" strokeWidth="6" fill="transparent" />
            <circle
              cx="40"
              cy="40"
              r="25"
              stroke="#30d158"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 25}
              strokeDashoffset={(2 * Math.PI * 25) * (1 - Math.min(1, todayNicotineMg / 20))}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500"
            />

            {/* Inner Cyan Ring (Sessions) */}
            <circle cx="40" cy="40" r="16" stroke="rgba(100, 210, 255, 0.2)" strokeWidth="6" fill="transparent" />
            <circle
              cx="40"
              cy="40"
              r="16"
              stroke="#64d2ff"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 16}
              strokeDashoffset={(2 * Math.PI * 16) * (1 - Math.min(1, todaySessionsCount / 10))}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500"
            />
          </svg>
        </div>
      </div>

      {/* Main Radial Notch Arc Gauge */}
      <div className="glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Ambient glow backdrop */}
        <div className={`absolute h-48 w-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500 ${
          isOverLimit ? 'bg-red-600 opacity-40' : 'bg-[var(--accent-purple)]'
        }`} />

        <div className="relative flex items-center justify-center h-64 w-64">
          <svg className="h-full w-full transform rotate-135" viewBox="0 0 200 200">
            {Array.from({ length: TOTAL_TICKS }).map((_, index) => {
              const angle = (index / (TOTAL_TICKS - 1)) * 270;
              const angleRad = (angle * Math.PI) / 180;
              const isActive = index < activeTicksCount;

              const innerR = 74;
              const outerR = 88;
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
                        : 'var(--accent-purple)'
                      : 'rgba(255,255,255,0.12)'
                  }
                  strokeWidth={isActive ? '3.5' : '2'}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>

          {/* Central Radial Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Puffs today
            </span>

            <div className="my-1 flex items-baseline justify-center gap-1">
              <span className={`text-5xl font-extrabold tracking-tight ${isOverLimit ? 'text-red-500 animate-pulse' : 'text-[var(--text-main)]'}`}>
                {todayCount}
              </span>
              <span className="text-xl font-bold text-[var(--text-muted)]">
                /{currentLimit}
              </span>
            </div>

            {isOverLimit ? (
              <div className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400 border border-red-500/30">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Over limit!</span>
              </div>
            ) : (
              <div className="rounded-full bg-[var(--bg-accent-pill)] px-3.5 py-1 text-xs font-medium text-[var(--text-muted)] border border-[var(--border-subtle)]">
                Last hit: <span className="text-[var(--text-main)] font-semibold">{formatTimeSinceLastHit(timeSinceLastPuffSeconds)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mood trigger selector */}
        <div className="mt-2 w-full flex flex-col items-center">
          <button
            onClick={() => setShowMoodSelector(!showMoodSelector)}
            className="text-xs text-[var(--accent-purple)] hover:underline font-semibold mb-1"
          >
            {selectedMood ? `Mood: ${selectedMood} (Tap to change)` : '+ Tag Trigger / Mood'}
          </button>

          {showMoodSelector && (
            <div className="flex flex-wrap gap-1.5 justify-center py-2 px-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] w-full transition-all">
              {moodList.map((mood) => (
                <button
                  key={mood}
                  onClick={() => {
                    setSelectedMood(selectedMood === mood ? null : mood);
                    setShowMoodSelector(false);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-xl font-semibold transition-all ${
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

      {/* Main Touch Buttons */}
      <div className="flex items-center gap-3">
        {/* Big Apple PUFF! (+) Button */}
        <button
          onClick={handlePuffClick}
          className={`relative flex-1 flex items-center justify-center gap-3 py-5 rounded-3xl font-extrabold text-xl shadow-2xl transition-all duration-200 active:scale-95 ${
            isPuffing ? 'scale-95' : ''
          }`}
          style={{
            background: isOverLimit
              ? 'linear-gradient(135deg, #ff453a 0%, #ff3b30 100%)'
              : 'linear-gradient(135deg, #0a84ff 0%, #007aff 100%)',
            boxShadow: '0 12px 35px -5px rgba(10, 132, 255, 0.5)',
            color: '#ffffff',
          }}
        >
          <Plus className="h-7 w-7 stroke-[3]" />
          <span>PUFF!</span>
        </button>

        {/* Small Undo (-) Button */}
        <button
          onClick={undoLastPuff}
          title="Undo last puff"
          className="flex h-16 w-16 items-center justify-center rounded-3xl glass-panel text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/10 active:scale-90 transition-all shadow-lg"
        >
          <Minus className="h-6 w-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Quick Add Multi Hits Row */}
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="text-xs font-semibold text-[var(--text-muted)]">Quick Session:</span>
        <div className="flex items-center gap-2">
          {[1, 3, 5].map((count) => (
            <button
              key={count}
              onClick={() => addMultiplePuffs(count)}
              className="px-3.5 py-1.5 rounded-2xl glass-panel text-xs font-bold text-[var(--text-main)] hover:bg-[var(--accent-purple-glow)] hover:border-[var(--accent-purple)] transition-all active:scale-95"
            >
              +{count} hits
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

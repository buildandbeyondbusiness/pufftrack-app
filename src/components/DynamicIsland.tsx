import React, { useState, useEffect } from 'react';
import { usePuff } from '../context/PuffContext';
import { Flame, AlertTriangle, ChevronDown, Plus } from 'lucide-react';

interface DynamicIslandProps {
  lastHitPulseTime?: number;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({ lastHitPulseTime }) => {
  const {
    todayCount,
    currentLimit,
    todayNicotineMg,
    timeSinceLastPuffSeconds,
    addPuff,
    vapeProfile,
  } = usePuff();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isPuffPulse, setIsPuffPulse] = useState(false);

  // Trigger expanded pulse animation when puff hit happens
  useEffect(() => {
    if (lastHitPulseTime && lastHitPulseTime > 0) {
      setIsPuffPulse(true);
      const timer = setTimeout(() => setIsPuffPulse(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [lastHitPulseTime]);

  const isOverLimit = todayCount >= currentLimit;

  // Format Vape-Free Clean Time Stopwatch
  const formatTimeAgo = (totalSeconds: number) => {
    if (totalSeconds < 60) return `${totalSeconds}s ago`;
    const mins = Math.floor(totalSeconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="sticky top-2 z-50 flex justify-center w-full px-4 pointer-events-none">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`pointer-events-auto relative flex items-center justify-between shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer backdrop-blur-3xl select-none ${
          isExpanded
            ? 'w-full max-w-[360px] rounded-[32px] p-4 bg-black/90 border border-white/20 shadow-sky-500/20 shadow-2xl'
            : isPuffPulse
            ? 'w-[280px] rounded-full px-4 py-2.5 bg-black/95 border border-indigo-500/50 shadow-indigo-500/40 ring-4 ring-indigo-500/20'
            : isOverLimit
            ? 'w-[210px] rounded-full px-3.5 py-1.5 bg-black/90 border border-red-500/50 shadow-red-500/30'
            : 'w-[190px] rounded-full px-3 py-1.5 bg-black/80 border border-white/10 hover:border-white/25 hover:w-[205px]'
        }`}
      >
        {/* Expanded Live Activity Widget View */}
        {isExpanded ? (
          <div className="flex flex-col gap-3 w-full animate-in fade-in zoom-in-95 duration-300">
            {/* Top Widget Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-purple-glow)] text-[var(--accent-purple)]">
                  <Flame className="h-4 w-4 fill-[var(--accent-purple)]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>PuffTrack Live Activity</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="text-[10px] text-zinc-400">{vapeProfile.deviceName}</div>
                </div>
              </div>

              <ChevronDown className="h-4 w-4 text-zinc-400 hover:text-white transition-colors" />
            </div>

            {/* Middle Stats Grid inside Dynamic Island */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-white/5 p-2">
                <div className="text-lg font-extrabold text-white">{todayCount}</div>
                <div className="text-[9px] text-zinc-400 uppercase font-semibold">Today</div>
              </div>

              <div className="rounded-2xl bg-white/5 p-2">
                <div className="text-lg font-extrabold text-indigo-400">{todayNicotineMg} <span className="text-[9px]">mg</span></div>
                <div className="text-[9px] text-zinc-400 uppercase font-semibold">Nicotine</div>
              </div>

              <div className="rounded-2xl bg-white/5 p-2">
                <div className="text-lg font-extrabold text-emerald-400">{currentLimit}</div>
                <div className="text-[9px] text-zinc-400 uppercase font-semibold">Limit</div>
              </div>
            </div>

            {/* Bottom Quick Hit Button inside Dynamic Island */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-zinc-400">
                Last hit: <span className="text-white font-semibold">{formatTimeAgo(timeSinceLastPuffSeconds)}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addPuff();
                }}
                className="flex items-center gap-1 rounded-full bg-[var(--accent-purple)] px-3 py-1 text-xs font-bold text-white shadow-lg hover:opacity-90 active:scale-95 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Quick Hit</span>
              </button>
            </div>
          </div>
        ) : isPuffPulse ? (
          /* Puff Hit Pulse Dynamic Mode */
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-indigo-400 animate-ping" />
              <span className="text-xs font-bold text-white tracking-wide">Puff Logged!</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-indigo-400">{todayCount}</span>
              <span className="text-[10px] text-zinc-400">/ {currentLimit}</span>
            </div>
          </div>
        ) : isOverLimit ? (
          /* Over Limit Warning Dynamic Pill */
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
              <AlertTriangle className="h-3.5 w-3.5 animate-bounce" />
              <span>Limit Reached</span>
            </div>

            <span className="text-xs font-extrabold text-white">{todayCount}/{currentLimit}</span>
          </div>
        ) : (
          /* Compact Idle Mode */
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white tracking-tight">{todayCount}</span>
              <span className="text-[10px] text-zinc-400">/ {currentLimit}</span>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400">
              <span>{formatTimeAgo(timeSinceLastPuffSeconds)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

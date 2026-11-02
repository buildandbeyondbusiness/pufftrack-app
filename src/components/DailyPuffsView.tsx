import React, { useState, useMemo } from 'react';
import { usePuff } from '../context/PuffContext';
import { Plus, Minus, Info, X, Zap, Flame } from 'lucide-react';
import type { MoodTag } from '../types';
import { AnimatedDeviceFigure } from './AnimatedDeviceFigure';

interface DailyPuffsViewProps {
  onTriggerVapor: (e?: React.MouseEvent) => void;
  onOpenSettings?: () => void;
}

export const DailyPuffsView: React.FC<DailyPuffsViewProps> = ({ onTriggerVapor, onOpenSettings }) => {
  const {
    activeMode,
    setActiveMode,
    todayCount,
    currentLimit,
    todayNicotineMg,
    todaySessionsCount,
    todayVapingTimeSeconds,
    timeSinceLastPuffSeconds,
    addPuff,
    undoLastPuff,
    addMultiplePuffs,
    vapeProfile,
    todayPuffs,
    syncState,
  } = usePuff();

  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);
  const [showQuickHitFlyout, setShowQuickHitFlyout] = useState<boolean>(false);
  const [selectedMood, setSelectedMood] = useState<MoodTag | null>(null);
  const [isPressingPlus, setIsPressingPlus] = useState<boolean>(false);
  const [isPressingMinus, setIsPressingMinus] = useState<boolean>(false);

  const isVape = activeMode === 'vape';

  // Live timer for Vape-Free / Smoke-Free duration
  const cleanTimerFormatted = useMemo(() => {
    if (todayPuffs.length === 0) return '0h 0m 0s';
    const totalSecs = timeSinceLastPuffSeconds;
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours}h ${mins}m ${secs}s`;
  }, [timeSinceLastPuffSeconds, todayPuffs.length]);

  // Vaping time formatted: "2m 5s"
  const vapingTimeFormatted = useMemo(() => {
    const mins = Math.floor(todayVapingTimeSeconds / 60);
    const secs = todayVapingTimeSeconds % 60;
    return `${mins}m ${secs}s`;
  }, [todayVapingTimeSeconds]);

  // Cigarettes pack calculation
  const cigsLeftInPack = useMemo(() => {
    const perPack = vapeProfile.cigsPerPack || 20;
    const remainder = todayCount % perPack;
    return Math.max(0, perPack - remainder);
  }, [todayCount, vapeProfile.cigsPerPack]);

  // Radial Ticks Configuration
  // 60 ticks for Vape, 20 ticks for Cigarette (representing 20 sticks per pack!)
  const TOTAL_TICKS = isVape ? 60 : 20;
  const activeTicksCount = useMemo(() => {
    const ratio = Math.min(1, todayCount / Math.max(1, currentLimit));
    return Math.round(ratio * TOTAL_TICKS);
  }, [todayCount, currentLimit, TOTAL_TICKS]);

  const ticks = useMemo(() => {
    const list = [];
    const cx = 150;
    const cy = 150;
    const rInner = 108;
    const rOuter = 132;

    for (let i = 0; i < TOTAL_TICKS; i++) {
      // Start at top (-90 degrees)
      const angleDeg = (i * 360) / TOTAL_TICKS - 90;
      const angleRad = (angleDeg * Math.PI) / 180;

      const x1 = cx + rInner * Math.cos(angleRad);
      const y1 = cy + rInner * Math.sin(angleRad);
      const x2 = cx + rOuter * Math.cos(angleRad);
      const y2 = cy + rOuter * Math.sin(angleRad);

      const isActive = i < activeTicksCount;

      list.push({
        index: i,
        x1,
        y1,
        x2,
        y2,
        isActive,
      });
    }
    return list;
  }, [TOTAL_TICKS, activeTicksCount]);

  // Handle Main Puff / Cigarette Trigger
  const handlePuffClick = (e: React.MouseEvent) => {
    setIsPressingPlus(true);
    onTriggerVapor(e);
    addPuff(selectedMood || undefined);
    setTimeout(() => setIsPressingPlus(false), 220);
  };

  const handleMinusClick = () => {
    setIsPressingMinus(true);
    undoLastPuff();
    setTimeout(() => setIsPressingMinus(false), 200);
  };

  const moodsList: MoodTag[] = ['Morning', 'Stress', 'Habit', 'Social', 'Post Meal', 'Boredom', 'Craving'];

  return (
    <div className="flex flex-col items-center w-full px-5 pb-6">
      {/* Title & SuperBase Live Status Pill */}
      <div className="w-full flex items-center justify-between pt-1 pb-3">
        <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
          {isVape ? 'Daily Puffs' : 'Daily Smokes'}
        </h1>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold transition-all cursor-pointer select-none"
            title="Configure SuperBase"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  syncState === 'synced'
                    ? 'bg-emerald-400'
                    : syncState === 'syncing'
                    ? 'bg-purple-400'
                    : 'bg-zinc-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  syncState === 'synced'
                    ? 'bg-emerald-400'
                    : syncState === 'syncing'
                    ? 'bg-purple-400'
                    : 'bg-zinc-400'
                }`}
              />
            </span>
            <span className="text-[11px] text-zinc-300 font-medium">
              {syncState === 'synced'
                ? 'SuperBase'
                : syncState === 'syncing'
                ? 'Syncing...'
                : 'Local'}
            </span>
          </button>
        )}
      </div>

      {/* Sexy Apple-Style Glass Segmented Switcher (Vape vs Cigarette) */}
      <div className="relative flex items-center p-1 rounded-full bg-[#121214]/90 border border-white/10 backdrop-blur-2xl shadow-xl select-none mb-5">
        {/* Sliding active pill indicator */}
        <div
          className={`absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-md ${
            isVape
              ? 'left-1 w-[calc(50%-4px)] bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-500/40'
              : 'left-[calc(50%)] w-[calc(50%-4px)] bg-gradient-to-r from-orange-600 to-red-600 shadow-orange-500/40'
          }`}
        />

        {/* Vape Mode Pill */}
        <button
          onClick={() => setActiveMode('vape')}
          className={`relative z-10 flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            isVape ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${isVape ? 'text-purple-200 animate-pulse' : 'text-zinc-500'}`} />
          <span>Vape Pod</span>
        </button>

        {/* Cigarette Mode Pill */}
        <button
          onClick={() => setActiveMode('cigarette')}
          className={`relative z-10 flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            !isVape ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${!isVape ? 'text-amber-200 animate-pulse' : 'text-zinc-500'}`} />
          <span>Cigarette</span>
        </button>
      </div>

      {/* 4 Top Metric Cards (2x2 Grid) */}
      <div className="w-full grid grid-cols-2 gap-3 mb-4">
        {/* Card 1: Nicotine */}
        <div
          onClick={() => setActiveInfoModal('nicotine')}
          className="relative flex flex-col justify-between p-4 rounded-2xl bg-[#1c1c1e]/80 hover:bg-[#252528]/80 border border-white/[0.08] backdrop-blur-xl shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[13px] font-medium transition-colors ${
                isVape ? 'text-purple-300' : 'text-orange-300'
              }`}
            >
              Nicotine
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveInfoModal('nicotine');
              }}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold tracking-tight text-white">
              {todayNicotineMg} mg
            </span>
          </div>
        </div>

        {/* Card 2: Sessions or Sticks Count */}
        <div
          onClick={() => setActiveInfoModal('sessions')}
          className="relative flex flex-col justify-between p-4 rounded-2xl bg-[#1c1c1e]/80 hover:bg-[#252528]/80 border border-white/[0.08] backdrop-blur-xl shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[13px] font-medium transition-colors ${
                isVape ? 'text-purple-300' : 'text-orange-300'
              }`}
            >
              {isVape ? 'Sessions' : 'Sticks Left'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveInfoModal('sessions');
              }}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold tracking-tight text-white">
              {isVape ? todaySessionsCount : `${cigsLeftInPack}/20`}
            </span>
          </div>
        </div>

        {/* Card 3: Vape-Free / Smoke-Free */}
        <div
          onClick={() => setActiveInfoModal('vapeFree')}
          className="relative flex flex-col justify-between p-4 rounded-2xl bg-[#1c1c1e]/80 hover:bg-[#252528]/80 border border-white/[0.08] backdrop-blur-xl shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[13px] font-medium transition-colors ${
                isVape ? 'text-purple-300' : 'text-orange-300'
              }`}
            >
              {isVape ? 'Vape-Free' : 'Smoke-Free'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveInfoModal('vapeFree');
              }}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3">
            <span className="text-xl font-extrabold tracking-tight text-[#f59e0b] drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
              {cleanTimerFormatted}
            </span>
          </div>
        </div>

        {/* Card 4: Vaping Time / Cost */}
        <div
          onClick={() => setActiveInfoModal('vapingTime')}
          className="relative flex flex-col justify-between p-4 rounded-2xl bg-[#1c1c1e]/80 hover:bg-[#252528]/80 border border-white/[0.08] backdrop-blur-xl shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[13px] font-medium transition-colors ${
                isVape ? 'text-purple-300' : 'text-orange-300'
              }`}
            >
              {isVape ? 'Vaping Time' : 'Cost Today'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveInfoModal('vapingTime');
              }}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold tracking-tight text-white">
              {isVape ? vapingTimeFormatted : `₹${Math.round(todayCount * 18)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Center Circular Radial Tick Dial with Animated Figure */}
      <div className="relative flex flex-col items-center justify-center my-3">
        {/* Ambient atmospheric glow behind dial */}
        <div
          className={`absolute w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isVape ? 'bg-purple-600/18' : 'bg-orange-600/20'
          }`}
        />

        <div className="relative w-[300px] h-[300px] flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 300 300">
            {ticks.map((tick) => {
              const activeStroke = isVape ? '#c084fc' : '#f97316';
              const activeGlow = isVape
                ? 'drop-shadow(0 0 7px rgba(192, 132, 252, 0.95))'
                : 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.95))';

              return (
                <line
                  key={tick.index}
                  x1={tick.x1}
                  y1={tick.y1}
                  x2={tick.x2}
                  y2={tick.y2}
                  stroke={tick.isActive ? activeStroke : 'rgba(255, 255, 255, 0.12)'}
                  strokeWidth={isVape ? '3.5' : '4.5'}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                  style={{
                    filter: tick.isActive ? activeGlow : 'none',
                  }}
                />
              );
            })}
          </svg>

          {/* Center Content: Animated Figure + Counter */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* Animated Device Figure (Morphs btw Pod and Cigarette) */}
            <div className="mb-0.5">
              <AnimatedDeviceFigure mode={activeMode} isPuffing={isPressingPlus} />
            </div>

            <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase mt-1">
              {isVape ? 'Puffs today' : 'Smokes today'}
            </span>
            <span className="text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
              {todayCount}
            </span>
            <div className="mt-2.5 px-3.5 py-1 rounded-full bg-[#1c1c1e]/90 border border-white/10 shadow-inner">
              <span className="text-xs text-zinc-400 font-medium">
                {isVape ? 'Limit for today' : 'Daily limit'}{' '}
                <span className="text-white font-bold">{currentLimit}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mood Tag Filter Pill Bar */}
      <div className="w-full flex items-center justify-center gap-1.5 overflow-x-auto py-2 mb-2 scrollbar-none">
        {moodsList.slice(0, 5).map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMood(selectedMood === m ? null : m)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
              selectedMood === m
                ? isVape
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40'
                  : 'bg-orange-600 text-white shadow-lg shadow-orange-600/40'
                : 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 border border-white/[0.05]'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Bottom Action Controls matching Screenshot 1 */}
      <div className="w-full flex items-center gap-4 mt-2">
        {/* Large Glowing Pill Button */}
        <button
          onClick={handlePuffClick}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowQuickHitFlyout(true);
          }}
          className={`relative flex-1 h-[72px] rounded-[36px] flex items-center justify-center cursor-pointer transition-all duration-200 select-none ${
            isPressingPlus ? 'scale-95' : 'hover:scale-[1.01]'
          }`}
          style={{
            background: isVape
              ? 'linear-gradient(180deg, rgba(168, 85, 247, 0.45) 0%, rgba(126, 34, 206, 0.45) 100%)'
              : 'linear-gradient(180deg, rgba(249, 115, 22, 0.45) 0%, rgba(220, 38, 38, 0.45) 100%)',
            border: isVape
              ? '1px solid rgba(216, 180, 254, 0.35)'
              : '1px solid rgba(253, 186, 116, 0.35)',
            boxShadow: isVape
              ? '0 8px 32px 0 rgba(168, 85, 247, 0.35), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)'
              : '0 8px 32px 0 rgba(249, 115, 22, 0.35), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className="absolute inset-0 rounded-[36px] bg-gradient-to-t from-transparent via-white/5 to-white/20 pointer-events-none" />
          <Plus className="w-9 h-9 text-white stroke-[2.5] drop-shadow-md" />
        </button>

        {/* Circular "-" Button */}
        <button
          onClick={handleMinusClick}
          className={`w-[72px] h-[72px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 select-none ${
            isPressingMinus ? 'scale-90' : 'hover:scale-105'
          }`}
          style={{
            background: isVape
              ? 'linear-gradient(180deg, rgba(168, 85, 247, 0.45) 0%, rgba(126, 34, 206, 0.45) 100%)'
              : 'linear-gradient(180deg, rgba(249, 115, 22, 0.45) 0%, rgba(220, 38, 38, 0.45) 100%)',
            border: isVape
              ? '1px solid rgba(216, 180, 254, 0.35)'
              : '1px solid rgba(253, 186, 116, 0.35)',
            boxShadow: isVape
              ? '0 8px 32px 0 rgba(168, 85, 247, 0.25), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)'
              : '0 8px 32px 0 rgba(249, 115, 22, 0.25), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <Minus className="w-8 h-8 text-white stroke-[2.5] drop-shadow-md" />
        </button>
      </div>

      {/* Quick Hit Options Modal */}
      {showQuickHitFlyout && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-white/10 p-5 shadow-2xl flex flex-col gap-4 animate-scale-bounce">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Quick Log {isVape ? 'Puffs' : 'Cigarettes'}
              </h3>
              <button
                onClick={() => setShowQuickHitFlyout(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[1, 2, 3].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => {
                    addMultiplePuffs(cnt);
                    onTriggerVapor();
                    setShowQuickHitFlyout(false);
                  }}
                  className={`py-3 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                    isVape
                      ? 'bg-purple-600/20 hover:bg-purple-600/40 border-purple-500/30 text-purple-200'
                      : 'bg-orange-600/20 hover:bg-orange-600/40 border-orange-500/30 text-orange-200'
                  }`}
                >
                  +{cnt} {isVape ? 'Hits' : 'Sticks'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Metric Info Sheet Modal */}
      {activeInfoModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-white/10 p-6 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white capitalize">
                {activeInfoModal === 'vapeFree'
                  ? isVape
                    ? 'Vape-Free Timer'
                    : 'Smoke-Free Timer'
                  : activeInfoModal === 'vapingTime'
                  ? isVape
                    ? 'Active Vaping Duration'
                    : 'Cigarette Spend'
                  : activeInfoModal === 'nicotine'
                  ? 'Nicotine Consumption'
                  : isVape
                  ? 'Vaping Sessions'
                  : 'Pack Remaining'}
              </h3>
              <button
                onClick={() => setActiveInfoModal(null)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {activeInfoModal === 'vapeFree' &&
                `Counts the continuous elapsed time since your last ${isVape ? 'vape puff' : 'cigarette'}. Giving your body prolonged breaks accelerates oxygen saturation and vascular repair.`}
              {activeInfoModal === 'vapingTime' &&
                (isVape
                  ? 'Estimated cumulative time spent inhaling vapor today, based on puff frequency.'
                  : `Estimated cost based on ₹${vapeProfile.cigCostPerPack || 360} per 20-cigarette pack (₹18/stick).`)}
              {activeInfoModal === 'nicotine' &&
                (isVape
                  ? `Calculated based on your ${vapeProfile.deviceName} (${vapeProfile.nicotineMgPerMl}mg/ml over ${vapeProfile.totalPuffsPerPod} puffs). Every pull delivers approximately ${(
                      ((vapeProfile.nicotineMgPerMl || 50) * (vapeProfile.podCapacityMl || 13)) /
                      (vapeProfile.totalPuffsPerPod || 5000)
                    ).toFixed(2)} mg.`
                  : `Calculated at ~1.2 mg nicotine per cigarette stick. ${todayCount} cigarettes smoked = ${todayNicotineMg} mg absorbed.`)}
              {activeInfoModal === 'sessions' &&
                (isVape
                  ? 'A session is defined by consecutive puffs logged within 5 minutes of each other.'
                  : `${cigsLeftInPack} sticks remaining in your current 20-pack.`)}
            </p>

            <button
              onClick={() => setActiveInfoModal(null)}
              className={`mt-2 w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${
                isVape ? 'bg-purple-600 hover:bg-purple-500' : 'bg-orange-600 hover:bg-orange-500'
              }`}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

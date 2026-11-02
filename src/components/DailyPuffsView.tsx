import React, { useState, useMemo } from 'react';
import { usePuff } from '../context/PuffContext';
import { Plus, Minus, Zap, Flame } from 'lucide-react';
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
    vapeProfile,
    todayPuffs,
    syncState,
  } = usePuff();

  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);
  const [isPressingPlus, setIsPressingPlus] = useState<boolean>(false);
  const [isPressingMinus, setIsPressingMinus] = useState<boolean>(false);

  const isVape = activeMode === 'vape';

  // Live timer for Vape-Free / Smoke-Free duration (matching Screenshot 1: "1h 19m 0s")
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

  // Radial Ticks Configuration matching Screenshot 1
  // 60 radial ticks in a clean circular dial
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
    const rOuter = 130;

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
    addPuff();
    setTimeout(() => setIsPressingPlus(false), 200);
  };

  const handleMinusClick = () => {
    setIsPressingMinus(true);
    undoLastPuff();
    setTimeout(() => setIsPressingMinus(false), 180);
  };

  return (
    <div className="flex flex-col items-center w-full px-5 pb-4 select-none">
      {/* Centered Header matching Screenshot 1 */}
      <div className="relative w-full flex items-center justify-center pt-1 pb-3">
        <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm text-center">
          {isVape ? 'Daily Puffs' : 'Daily Smokes'}
        </h1>

        {/* Discreet SuperBase Cloud Sync Pill on top right */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="absolute right-0 top-1.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold transition-all cursor-pointer select-none"
            title="SuperBase Connected"
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
            <span className="text-[10px] text-zinc-400 font-medium">
              {syncState === 'synced' ? 'SuperBase' : syncState === 'syncing' ? 'Sync...' : 'Local'}
            </span>
          </button>
        )}
      </div>

      {/* Sexy Apple-Style Glass Segmented Switcher & Interactive Figure Companion */}
      <div className="w-full flex items-center justify-center gap-2.5 mb-4">
        {/* Segmented Switcher */}
        <div className="relative flex items-center p-1 rounded-full bg-[#18181c]/90 border border-white/10 backdrop-blur-2xl shadow-xl select-none flex-1 max-w-[270px]">
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
            className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isVape ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isVape ? 'text-purple-200 animate-pulse' : 'text-zinc-500'}`} />
            <span>Vape Pod</span>
          </button>

          {/* Cigarette Mode Pill */}
          <button
            onClick={() => setActiveMode('cigarette')}
            className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              !isVape ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${!isVape ? 'text-amber-200 animate-pulse' : 'text-zinc-500'}`} />
            <span>Cigarette</span>
          </button>
        </div>

        {/* Interactive Device Figure Miniature */}
        <div className="flex items-center justify-center h-10 px-2 rounded-2xl bg-[#18181c]/80 border border-white/10 backdrop-blur-xl shadow-md">
          <AnimatedDeviceFigure mode={activeMode} isPuffing={isPressingPlus} />
        </div>
      </div>

      {/* 4 Top Metric Cards (2x2 Grid) matching Screenshot 1 */}
      <div className="w-full grid grid-cols-2 gap-3 mb-3">
        {/* Card 1: Nicotine */}
        <div
          onClick={() => setActiveInfoModal('nicotine')}
          className="relative flex flex-col justify-between p-4 rounded-[22px] bg-[#18181c]/85 hover:bg-[#202025]/85 border border-white/[0.08] backdrop-blur-xl shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[13px] font-medium transition-colors ${
                isVape ? 'text-[#c4b5fd]' : 'text-[#fdba74]'
              }`}
            >
              Nicotine
            </span>
            <div className="w-4 h-4 rounded-full border border-zinc-600/70 flex items-center justify-center text-zinc-400 text-[10px] font-bold">
              i
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-[22px] font-bold tracking-tight text-white">
              {todayNicotineMg} mg
            </span>
          </div>
        </div>

        {/* Card 2: Sessions or Sticks */}
        <div
          onClick={() => setActiveInfoModal('sessions')}
          className="relative flex flex-col justify-between p-4 rounded-[22px] bg-[#18181c]/85 hover:bg-[#202025]/85 border border-white/[0.08] backdrop-blur-xl shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[13px] font-medium transition-colors ${
                isVape ? 'text-[#c4b5fd]' : 'text-[#fdba74]'
              }`}
            >
              {isVape ? 'Sessions' : 'Sticks Left'}
            </span>
            <div className="w-4 h-4 rounded-full border border-zinc-600/70 flex items-center justify-center text-zinc-400 text-[10px] font-bold">
              i
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-[22px] font-bold tracking-tight text-white">
              {isVape ? todaySessionsCount : `${cigsLeftInPack}/20`}
            </span>
          </div>
        </div>

        {/* Card 3: Vape-Free / Smoke-Free */}
        <div
          onClick={() => setActiveInfoModal('vapeFree')}
          className="relative flex flex-col justify-between p-4 rounded-[22px] bg-[#18181c]/85 hover:bg-[#202025]/85 border border-white/[0.08] backdrop-blur-xl shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[13px] font-medium transition-colors ${
                isVape ? 'text-[#c4b5fd]' : 'text-[#fdba74]'
              }`}
            >
              {isVape ? 'Vape-Free' : 'Smoke-Free'}
            </span>
            <div className="w-4 h-4 rounded-full border border-zinc-600/70 flex items-center justify-center text-zinc-400 text-[10px] font-bold">
              i
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-[19px] font-bold tracking-tight text-[#f59e0b] drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]">
              {cleanTimerFormatted}
            </span>
          </div>
        </div>

        {/* Card 4: Vaping Time / Cost Today */}
        <div
          onClick={() => setActiveInfoModal('vapingTime')}
          className="relative flex flex-col justify-between p-4 rounded-[22px] bg-[#18181c]/85 hover:bg-[#202025]/85 border border-white/[0.08] backdrop-blur-xl shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[13px] font-medium transition-colors ${
                isVape ? 'text-[#c4b5fd]' : 'text-[#fdba74]'
              }`}
            >
              {isVape ? 'Vaping Time' : 'Cost Today'}
            </span>
            <div className="w-4 h-4 rounded-full border border-zinc-600/70 flex items-center justify-center text-zinc-400 text-[10px] font-bold">
              i
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-[22px] font-bold tracking-tight text-white">
              {isVape ? vapingTimeFormatted : `₹${Math.round(todayCount * 18)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Center Circular Radial Tick Dial matching Screenshot 1 */}
      <div className="relative flex flex-col items-center justify-center my-2">
        {/* Ambient atmospheric glow behind dial */}
        <div
          className={`absolute w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isVape ? 'bg-purple-600/20' : 'bg-orange-600/20'
          }`}
        />

        <div className="relative w-[290px] h-[290px] flex items-center justify-center">
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

          {/* Center Content: Puffs today / Count / Limit for today */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-[13px] font-medium text-zinc-400/90 tracking-wide">
              {isVape ? 'Puffs today' : 'Smokes today'}
            </span>
            <span className="text-[68px] font-extrabold tracking-tight text-[#faf5ff] leading-none my-1 drop-shadow-md">
              {todayCount}
            </span>
            <div className="mt-2 px-4 py-1.5 rounded-full bg-[#1f1f24] border border-white/[0.08] shadow-inner">
              <span className="text-xs text-zinc-400 font-medium">
                {isVape ? 'Limit for today' : 'Daily limit'}{' '}
                <span className="text-white font-bold">{currentLimit}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Controls matching Screenshot 1 */}
      <div className="w-full flex items-center gap-3.5 mt-2">
        {/* Large Glowing Pill Button */}
        <button
          onClick={handlePuffClick}
          className={`relative flex-1 h-[70px] rounded-[35px] flex items-center justify-center cursor-pointer transition-all duration-200 select-none ${
            isPressingPlus ? 'scale-95' : 'hover:scale-[1.01] active:scale-95'
          }`}
          style={{
            background: isVape
              ? 'linear-gradient(180deg, rgba(168, 135, 215, 0.5) 0%, rgba(120, 95, 185, 0.6) 100%)'
              : 'linear-gradient(180deg, rgba(249, 115, 22, 0.5) 0%, rgba(220, 38, 38, 0.6) 100%)',
            border: isVape
              ? '1px solid rgba(216, 180, 254, 0.4)'
              : '1px solid rgba(253, 186, 116, 0.4)',
            boxShadow: isVape
              ? '0 10px 30px -5px rgba(168, 85, 247, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.4)'
              : '0 10px 30px -5px rgba(249, 115, 22, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
          }}
        >
          <div className="absolute inset-0 rounded-[35px] bg-gradient-to-t from-transparent via-white/5 to-white/20 pointer-events-none" />
          <Plus className="w-9 h-9 text-white stroke-[2.8] drop-shadow-md" />
        </button>

        {/* Circular "-" Button */}
        <button
          onClick={handleMinusClick}
          className={`w-[70px] h-[70px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 select-none ${
            isPressingMinus ? 'scale-90' : 'hover:scale-105 active:scale-90'
          }`}
          style={{
            background: isVape
              ? 'linear-gradient(180deg, rgba(168, 135, 215, 0.5) 0%, rgba(120, 95, 185, 0.6) 100%)'
              : 'linear-gradient(180deg, rgba(249, 115, 22, 0.5) 0%, rgba(220, 38, 38, 0.6) 100%)',
            border: isVape
              ? '1px solid rgba(216, 180, 254, 0.4)'
              : '1px solid rgba(253, 186, 116, 0.4)',
            boxShadow: isVape
              ? '0 10px 30px -5px rgba(168, 85, 247, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.4)'
              : '0 10px 30px -5px rgba(249, 115, 22, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
          }}
        >
          <Minus className="w-8 h-8 text-white stroke-[2.8] drop-shadow-md" />
        </button>
      </div>

      {/* Info Modal Dialog */}
      {activeInfoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setActiveInfoModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#1c1c1e] border border-white/10 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-2">
              {activeInfoModal === 'nicotine' && 'Nicotine Absorption'}
              {activeInfoModal === 'sessions' && (isVape ? 'Vape Sessions' : 'Cigarette Pack')}
              {activeInfoModal === 'vapeFree' && (isVape ? 'Vape-Free Time' : 'Smoke-Free Time')}
              {activeInfoModal === 'vapingTime' && (isVape ? 'Active Inhalation' : 'Daily Spend')}
            </h3>
            <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
              {activeInfoModal === 'nicotine' &&
                `Calculated based on your e-liquid strength (${vapeProfile.nicotineMgPerMl}mg/ml). You have absorbed approx ${todayNicotineMg}mg nicotine today.`}
              {activeInfoModal === 'sessions' &&
                (isVape
                  ? `Sessions are counted automatically when hits occur closely together. You completed ${todaySessionsCount} sessions today.`
                  : `Tracks sticks remaining in your 20-stick pack. You have ${cigsLeftInPack} sticks left.`)}
              {activeInfoModal === 'vapeFree' &&
                `Shows the elapsed time since your last logged hit. Keep this clock climbing!`}
              {activeInfoModal === 'vapingTime' &&
                (isVape
                  ? `Estimated cumulative inhalation time based on ~2 seconds per puff (${vapingTimeFormatted}).`
                  : `Estimated cost based on your pack price (${vapeProfile.cigCostPerPack || 360} for 20 sticks).`)}
            </p>
            <button
              onClick={() => setActiveInfoModal(null)}
              className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

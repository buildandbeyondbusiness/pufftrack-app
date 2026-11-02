import React, { useEffect, useState } from 'react';
import type { ConsumptionType } from '../types';

interface AnimatedDeviceFigureProps {
  mode: ConsumptionType;
  isPuffing?: boolean;
  compact?: boolean;
}

export const AnimatedDeviceFigure: React.FC<AnimatedDeviceFigureProps> = ({
  mode,
  isPuffing = false,
  compact = false,
}) => {
  const [emberFlare, setEmberFlare] = useState(false);

  useEffect(() => {
    if (isPuffing && mode === 'cigarette') {
      setEmberFlare(true);
      const timer = setTimeout(() => setEmberFlare(false), 900);
      return () => clearTimeout(timer);
    }
  }, [isPuffing, mode]);

  if (compact) {
    return (
      <div className="relative flex items-center justify-center w-20 h-9 pointer-events-none select-none transition-all duration-300">
        {mode === 'vape' ? (
          <div
            className={`flex items-center gap-1.5 transition-all duration-300 ${
              isPuffing ? 'scale-110 -translate-y-0.5' : 'scale-100'
            }`}
          >
            {/* Mini Pod silhouette */}
            <div className="w-4 h-7 rounded-md bg-gradient-to-b from-zinc-700 via-zinc-900 to-black border border-purple-400/50 relative overflow-hidden flex flex-col justify-end p-0.5 shadow-sm">
              <div className="w-full h-3 rounded-b-sm bg-purple-500/80 animate-pulse" />
              <div className="absolute top-1 left-1.5 w-1 h-1 rounded-full bg-purple-400 shadow-[0_0_4px_#c084fc]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-purple-300 leading-tight">POD</span>
              <span className="text-[8px] text-zinc-400 leading-tight">ACTIVE</span>
            </div>
          </div>
        ) : (
          <div
            className={`flex items-center gap-1.5 transition-all duration-300 ${
              isPuffing ? 'scale-110 -translate-y-0.5' : 'scale-100'
            }`}
          >
            {/* Mini Cigarette stick */}
            <div className="flex items-center shadow-md">
              <div className="w-2.5 h-3.5 rounded-l-xs bg-amber-700 border-r border-amber-900/40" />
              <div className="w-6 h-3 bg-stone-200" />
              <div
                className={`w-1.5 h-3 rounded-r-xs transition-all duration-200 ${
                  emberFlare ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' : 'bg-red-700'
                }`}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-orange-400 leading-tight">CIG</span>
              <span className="text-[8px] text-zinc-400 leading-tight">PACK</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center w-24 h-10 pointer-events-none select-none transition-all duration-500">
      {mode === 'vape' ? (
        /* ================= VAPE POD FIGURE ================= */
        <div
          className={`relative flex items-center gap-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isPuffing ? 'scale-110 -translate-y-0.5' : 'scale-100'
          }`}
        >
          {/* Drifting Vapor Wisps */}
          <div className="absolute -top-3 left-1.5 flex gap-0.5 pointer-events-none opacity-80">
            <span
              className={`w-1 h-3 rounded-full bg-gradient-to-t from-purple-400/80 to-transparent blur-[0.5px] animate-pulse ${
                isPuffing ? 'h-6 opacity-100' : 'h-3'
              }`}
            />
            <span
              className={`w-1 h-4 rounded-full bg-gradient-to-t from-indigo-300/80 to-transparent blur-[0.5px] animate-pulse ${
                isPuffing ? 'h-7 opacity-100' : 'h-4'
              }`}
            />
          </div>

          {/* Pod Mini Glass */}
          <div className="w-5 h-8 rounded-lg bg-gradient-to-b from-zinc-800 via-zinc-950 to-black border border-purple-400/40 p-0.5 flex flex-col justify-between shadow-md relative overflow-hidden">
            <div className="w-1.5 h-1 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc] mx-auto mt-0.5" />
            <div className="w-full h-3.5 rounded-b-md bg-gradient-to-t from-purple-600 to-indigo-500/80 shadow-inner" />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-wider">
              Vape Pod
            </span>
            <span className="text-[8.5px] font-semibold text-zinc-400">
              {isPuffing ? 'Inhaling...' : 'Ready'}
            </span>
          </div>
        </div>
      ) : (
        /* ================= CIGARETTE FIGURE ================= */
        <div
          className={`relative flex items-center gap-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isPuffing ? 'scale-110 -translate-y-0.5' : 'scale-100'
          }`}
        >
          {/* Cigarette Stick */}
          <div className="relative flex items-center shadow-lg filter">
            {/* Filter */}
            <div
              className="w-3.5 h-3.5 rounded-l-xs border-r border-amber-900/40 flex items-center justify-end"
              style={{
                background: 'linear-gradient(180deg, #d97706 0%, #b45309 60%, #92400e 100%)',
              }}
            >
              <div className="w-0.5 h-full bg-yellow-300/60 mr-0.5" />
            </div>

            {/* Paper */}
            <div className="w-8 h-3 bg-gradient-to-b from-stone-100 via-zinc-200 to-stone-300 shadow-sm" />

            {/* Ember Tip */}
            <div
              className={`relative w-2 h-3 rounded-r-xs transition-all duration-300 ${
                emberFlare ? 'scale-125' : 'scale-100'
              }`}
              style={{
                background: emberFlare
                  ? 'linear-gradient(90deg, #f97316 0%, #ef4444 40%, #fef08a 100%)'
                  : 'linear-gradient(90deg, #78350f 0%, #dc2626 50%, #f97316 100%)',
                boxShadow: emberFlare
                  ? '0 0 12px 3px rgba(249, 115, 22, 0.95)'
                  : '0 0 6px 1px rgba(249, 115, 22, 0.7)',
              }}
            />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-wider">
              Cigarette
            </span>
            <span className="text-[8.5px] font-semibold text-zinc-400">
              {emberFlare ? 'Flaring...' : 'Ready'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

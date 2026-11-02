import React, { useEffect, useState } from 'react';
import type { ConsumptionType } from '../types';

interface AnimatedDeviceFigureProps {
  mode: ConsumptionType;
  isPuffing?: boolean;
}

export const AnimatedDeviceFigure: React.FC<AnimatedDeviceFigureProps> = ({ mode, isPuffing = false }) => {
  const [emberFlare, setEmberFlare] = useState(false);

  useEffect(() => {
    if (isPuffing && mode === 'cigarette') {
      setEmberFlare(true);
      const timer = setTimeout(() => setEmberFlare(false), 900);
      return () => clearTimeout(timer);
    }
  }, [isPuffing, mode]);

  return (
    <div className="relative flex items-center justify-center w-28 h-20 pointer-events-none select-none transition-all duration-500">
      {mode === 'vape' ? (
        /* ================= VAPE POD FIGURE ================= */
        <div
          className={`relative flex flex-col items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isPuffing ? 'scale-110 -translate-y-1' : 'scale-100'
          }`}
        >
          {/* Drifting Vapor Wisps from Mouthpiece */}
          <div className="absolute -top-7 flex gap-1 pointer-events-none opacity-80">
            <span
              className={`w-1.5 h-6 rounded-full bg-gradient-to-t from-purple-400/60 to-transparent blur-[1px] animate-pulse ${
                isPuffing ? 'h-10 opacity-100' : 'h-6'
              }`}
              style={{ animationDuration: '1.8s' }}
            />
            <span
              className={`w-2 h-7 rounded-full bg-gradient-to-t from-indigo-300/60 to-transparent blur-[1px] animate-pulse ${
                isPuffing ? 'h-11 opacity-100' : 'h-7'
              }`}
              style={{ animationDuration: '2.4s', animationDelay: '0.3s' }}
            />
            <span
              className={`w-1.5 h-5 rounded-full bg-gradient-to-t from-purple-400/50 to-transparent blur-[1px] animate-pulse ${
                isPuffing ? 'h-9 opacity-100' : 'h-5'
              }`}
              style={{ animationDuration: '1.5s', animationDelay: '0.6s' }}
            />
          </div>

          {/* Vape Mouthpiece */}
          <div className="w-6 h-3 rounded-t-lg bg-gradient-to-b from-zinc-700 to-zinc-900 border border-purple-400/30 shadow-inner" />

          {/* Pod Glass E-Liquid Window */}
          <div className="w-12 h-14 rounded-2xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-purple-400/40 p-1 flex flex-col items-center justify-between shadow-xl relative overflow-hidden">
            {/* Liquid Level Indicator with Wave */}
            <div
              className="absolute inset-x-0 bottom-0 h-8 rounded-b-xl opacity-70 transition-all duration-300"
              style={{
                background:
                  'linear-gradient(180deg, rgba(168, 85, 247, 0.6) 0%, rgba(124, 58, 237, 0.9) 100%)',
                boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.4)',
              }}
            >
              <div className="w-full h-1 bg-purple-300/60 blur-[0.5px] rounded-full animate-pulse" />
            </div>

            {/* Micro OLED Breathing LED Ring */}
            <div className="relative z-10 w-2.5 h-2.5 rounded-full mt-1.5 flex items-center justify-center">
              <span
                className={`w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc] ${
                  isPuffing ? 'animate-ping' : 'animate-pulse'
                }`}
              />
            </div>

            {/* Futuristic Texture Marks */}
            <div className="relative z-10 flex gap-0.5 mb-1 opacity-40">
              <span className="w-1 h-1 rounded-full bg-white" />
              <span className="w-1 h-1 rounded-full bg-white" />
              <span className="w-1 h-1 rounded-full bg-white" />
            </div>
          </div>

          {/* Ambient Device Violet Glow */}
          <div className="absolute -inset-3 rounded-full bg-purple-600/20 blur-xl pointer-events-none -z-10" />
        </div>
      ) : (
        /* ================= CIGARETTE FIGURE ================= */
        <div
          className={`relative flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isPuffing ? 'scale-110 -translate-y-1' : 'scale-100'
          }`}
        >
          {/* Drifting Heat Smoke from Cigarette Tip */}
          <div className="absolute -right-6 -top-6 flex flex-col items-center pointer-events-none opacity-85">
            <span
              className={`w-1.5 h-6 rounded-full bg-gradient-to-t from-orange-500/70 via-zinc-400/30 to-transparent blur-[1px] animate-pulse ${
                emberFlare ? 'h-10 opacity-100' : 'h-6'
              }`}
              style={{ animationDuration: '1.4s' }}
            />
            <span
              className={`w-2 h-7 rounded-full bg-gradient-to-t from-red-500/60 via-zinc-400/20 to-transparent blur-[1px] animate-pulse ${
                emberFlare ? 'h-11 opacity-100' : 'h-7'
              }`}
              style={{ animationDuration: '2s', animationDelay: '0.2s' }}
            />
          </div>

          {/* Cigarette Body */}
          <div className="relative flex items-center shadow-2xl filter">
            {/* 1. Filter (Cork / Gold Band) */}
            <div
              className="w-7 h-5 rounded-l-md border-r border-amber-900/30 flex items-center justify-center shadow-inner"
              style={{
                background: 'linear-gradient(180deg, #d97706 0%, #b45309 60%, #92400e 100%)',
                boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4)',
              }}
            >
              {/* Gold foil ring seam */}
              <div className="w-1 h-full bg-yellow-300/60 ml-auto mr-0.5" />
            </div>

            {/* 2. White Paper Tobacco Roll */}
            <div
              className="w-16 h-4.5 bg-gradient-to-b from-stone-100 via-zinc-200 to-stone-300 flex items-center relative overflow-hidden shadow-sm"
              style={{
                boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0,0,0,0.4)',
              }}
            >
              {/* Fine paper ring lines */}
              <div className="w-full flex justify-around opacity-20">
                <span className="w-[1px] h-full bg-zinc-800" />
                <span className="w-[1px] h-full bg-zinc-800" />
                <span className="w-[1px] h-full bg-zinc-800" />
                <span className="w-[1px] h-full bg-zinc-800" />
              </div>
            </div>

            {/* 3. Ash Rim */}
            <div className="w-1.5 h-4.5 bg-gradient-to-r from-zinc-500 to-zinc-700" />

            {/* 4. Burning Cherry Ember Tip */}
            <div
              className={`relative w-3 h-4.5 rounded-r-md transition-all duration-300 ${
                emberFlare ? 'scale-125' : 'scale-100'
              }`}
              style={{
                background: emberFlare
                  ? 'linear-gradient(90deg, #f97316 0%, #ef4444 40%, #fef08a 100%)'
                  : 'linear-gradient(90deg, #78350f 0%, #dc2626 50%, #f97316 100%)',
                boxShadow: emberFlare
                  ? '0 0 18px 4px rgba(249, 115, 22, 0.95), 0 0 30px rgba(239, 68, 68, 0.8)'
                  : '0 0 10px 2px rgba(249, 115, 22, 0.7)',
              }}
            >
              {/* Hot core coal spark */}
              <span
                className={`absolute inset-0.5 rounded-r-sm bg-yellow-200 opacity-90 ${
                  emberFlare ? 'animate-ping' : 'animate-pulse'
                }`}
                style={{ animationDuration: '1.2s' }}
              />
            </div>
          </div>

          {/* Fiery Ember Aura Background Glow */}
          <div
            className={`absolute -inset-4 rounded-full pointer-events-none -z-10 transition-all duration-500 ${
              emberFlare
                ? 'bg-orange-500/35 blur-2xl scale-125'
                : 'bg-orange-600/15 blur-xl scale-100'
            }`}
          />
        </div>
      )}
    </div>
  );
};

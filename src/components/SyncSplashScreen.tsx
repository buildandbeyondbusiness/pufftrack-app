import React, { useEffect, useState, useRef, useCallback } from 'react';
import { usePuff } from '../context/PuffContext';
import { Check, Database, Sparkles } from 'lucide-react';

interface SyncSplashScreenProps {
  onComplete: () => void;
}

export const SyncSplashScreen: React.FC<SyncSplashScreenProps> = ({ onComplete }) => {
  const { syncStepMessage, isInitialSyncDone } = usePuff();
  const [progress, setProgress] = useState(25);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const hasFinishedRef = useRef(false);

  const finishAndTransition = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    setProgress(100);
    setShowCheck(true);

    setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        onCompleteRef.current();
      }, 450);
    }, 500);
  }, []);

  // Smooth progress sequence and guaranteed auto-open timer
  useEffect(() => {
    const t1 = setTimeout(() => setProgress(55), 150);
    const t2 = setTimeout(() => setProgress(88), 450);
    const t3 = setTimeout(() => setProgress(100), 800);

    // Guaranteed hard timeout: auto-open dashboard within 1.2 seconds max!
    const guaranteedOpenTimer = setTimeout(() => {
      finishAndTransition();
    }, 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(guaranteedOpenTimer);
    };
  }, [finishAndTransition]);

  // When Supabase signals sync completion
  useEffect(() => {
    if (isInitialSyncDone) {
      finishAndTransition();
    }
  }, [isInitialSyncDone, finishAndTransition]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-black text-white px-6 pb-12 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isFadingOut
          ? 'opacity-0 scale-105 pointer-events-none filter blur-sm'
          : 'opacity-100 scale-100'
      }`}
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 56px)',
        backgroundImage:
          'radial-gradient(circle at 50% 35%, rgba(168, 85, 247, 0.18) 0%, rgba(10, 10, 15, 0.95) 60%, #000000 100%)',
      }}
    >
      {/* Top Header / Branding safely below Dynamic Island */}
      <div className="flex flex-col items-center pt-2">
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md text-[11px] font-semibold tracking-wider text-purple-300 uppercase mb-2">
          <Database className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>SuperBase Cloud</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
          Daily Puffs
        </h1>
        <p className="text-xs text-zinc-400 mt-1">Apple-grade real-time telemetry</p>
      </div>

      {/* Center Breathing Aura & Animated Ring */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        {/* Ambient atmospheric glow */}
        <div className="absolute w-64 h-64 rounded-full bg-purple-600/20 blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute w-44 h-44 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

        {/* Outer Circular Radial Gauge / Ticks */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="5"
              strokeDasharray="4 6"
            />
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="none"
              stroke="url(#splash-purple-gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="427"
              strokeDashoffset={427 - (427 * progress) / 100}
              className="transition-all duration-300 ease-out"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.75))',
              }}
            />
            <defs>
              <linearGradient id="splash-purple-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Graphic */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {showCheck ? (
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-xl shadow-purple-500/40 animate-scale-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.07] border border-white/10 flex items-center justify-center shadow-inner backdrop-blur-md">
                    <Sparkles className="w-7 h-7 text-purple-300 animate-spin-slow" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black animate-ping" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stage Status Text */}
        <div className="mt-8 text-center max-w-xs">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-zinc-100">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span>{showCheck ? 'Sync Complete' : syncStepMessage}</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1.5 font-medium">
            {showCheck
              ? 'Opening your daily session...'
              : 'Verifying SuperBase tables & local cache'}
          </p>
        </div>
      </div>

      {/* Bottom Status / Skip Action */}
      <div className="w-full max-w-xs flex flex-col items-center pb-4">
        {/* Progress pill bar */}
        <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(168,85,247,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={finishAndTransition}
          className="text-xs font-semibold text-zinc-400 hover:text-white px-4 py-2 rounded-full transition-colors cursor-pointer active:scale-95"
        >
          {showCheck ? 'Opening Dashboard...' : 'Skip to Dashboard →'}
        </button>
      </div>
    </div>
  );
};

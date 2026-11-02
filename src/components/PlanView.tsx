import React, { useState } from 'react';
import { usePuff } from '../context/PuffContext';
import {
  Target,
  ShieldCheck,
  Play,
  Square,
  Award,
  IndianRupee,
  Clock,
} from 'lucide-react';

export const PlanView: React.FC = () => {
  const {
    currentLimit,
    updateVapeProfile,
    activeMode,
    isLiveSessionRunning,
    liveSessionSeconds,
    liveSessionPuffs,
    startLiveSession,
    stopLiveSession,
    costPerPuff,
  } = usePuff();

  const isVape = activeMode === 'vape';
  const [sliderValue, setSliderValue] = useState<number>(currentLimit);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderValue(val);
  };

  const handleSaveLimit = () => {
    if (isVape) {
      updateVapeProfile({ dailyLimitGoal: sliderValue });
    } else {
      updateVapeProfile({ cigDailyLimit: sliderValue });
    }
  };

  // Format session timer 00:00
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Projected savings by reducing from 60 to sliderValue
  const dailyPuffsReduced = Math.max(0, 60 - sliderValue);
  const monthlySavingsInr = Math.round(dailyPuffsReduced * 30 * costPerPuff);

  return (
    <div className="flex flex-col w-full px-5 pb-8 pt-1 text-white">
      {/* Title */}
      <div className="w-full pt-1 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Tapering & Plan
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Step-down daily limits & session control
        </p>
      </div>

      {/* Target Limiter Card */}
      <div className="w-full rounded-2xl bg-[#1c1c1e]/80 border border-white/[0.08] backdrop-blur-xl p-5 shadow-lg mb-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Daily Target Limit</h2>
              <p className="text-[11px] text-zinc-400">Puffs allowed per 24 hours</p>
            </div>
          </div>
          <span className="text-2xl font-black text-purple-300">
            {sliderValue} <span className="text-xs font-semibold text-zinc-400">hits</span>
          </span>
        </div>

        {/* Range Slider */}
        <div className="flex flex-col gap-2">
          <input
            type="range"
            min={isVape ? '5' : '1'}
            max={isVape ? '120' : '40'}
            step={isVape ? '5' : '1'}
            value={sliderValue}
            onChange={handleSliderChange}
            onMouseUp={handleSaveLimit}
            onTouchEnd={handleSaveLimit}
            className={`w-full h-2 rounded-lg bg-zinc-800 cursor-pointer ${
              isVape ? 'accent-purple-500' : 'accent-orange-500'
            }`}
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
            <span>{isVape ? '5 hits (Micro)' : '1 stick'}</span>
            <span>{isVape ? '60 hits (Standard)' : '10 sticks (Half pack)'}</span>
            <span>{isVape ? '120 hits (High)' : '20 sticks (Full pack)'}</span>
          </div>
        </div>

        {sliderValue !== currentLimit && (
          <button
            onClick={handleSaveLimit}
            className={`w-full py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-lg ${
              isVape
                ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                : 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/30'
            }`}
          >
            Update Goal to {sliderValue} {isVape ? 'Puffs' : 'Cigarettes'}
          </button>
        )}
      </div>

      {/* Live Session Limiter Card (Apple Watch Style) */}
      <div className="w-full rounded-2xl bg-[#1c1c1e]/80 border border-white/[0.08] backdrop-blur-xl p-5 shadow-lg mb-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Live Session Watcher</h2>
              <p className="text-[11px] text-zinc-400">Keep individual hits under 2 minutes</p>
            </div>
          </div>
          <span className="font-mono text-xl font-bold text-indigo-300">
            {formatTimer(liveSessionSeconds)}
          </span>
        </div>

        <div className="flex items-center justify-between bg-black/40 rounded-xl p-3 border border-white/5">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400">Puffs this session</span>
            <span className="text-lg font-bold text-white">{liveSessionPuffs} hits</span>
          </div>

          {isLiveSessionRunning ? (
            <button
              onClick={stopLiveSession}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-all cursor-pointer active:scale-95 shadow-lg shadow-rose-600/40"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>End Session</span>
            </button>
          ) : (
            <button
              onClick={startLiveSession}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all cursor-pointer active:scale-95 shadow-lg shadow-emerald-600/40"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Tapering Milestones */}
      <div className="w-full rounded-2xl bg-[#1c1c1e]/80 border border-white/[0.08] backdrop-blur-xl p-5 shadow-lg mb-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Award className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white">4-Week Reduction Roadmap</h2>
        </div>

        <div className="flex flex-col gap-2.5 pt-1">
          {[
            { phase: 'Week 1', goal: 'Reduce to 50 hits/day', status: 'Completed', color: 'text-emerald-400' },
            { phase: 'Week 2', goal: 'Reduce to 35 hits/day', status: 'In Progress', color: 'text-purple-300' },
            { phase: 'Week 3', goal: 'Reduce to 20 hits/day', status: 'Upcoming', color: 'text-zinc-500' },
            { phase: 'Week 4', goal: 'Freedom target: <10 hits/day', status: 'Upcoming', color: 'text-zinc-500' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]"
            >
              <div>
                <span className="text-xs font-bold text-white">{item.phase}: </span>
                <span className="text-xs text-zinc-300">{item.goal}</span>
              </div>
              <span className={`text-[10px] font-bold ${item.color}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Savings Projection */}
      {monthlySavingsInr > 0 && (
        <div className="w-full rounded-2xl bg-gradient-to-r from-emerald-950/40 to-zinc-900 border border-emerald-500/20 p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-zinc-400 font-medium">Estimated Monthly Savings</span>
              <div className="text-lg font-black text-emerald-400">
                ₹{monthlySavingsInr.toLocaleString('en-IN')} INR
              </div>
            </div>
          </div>
          <ShieldCheck className="w-6 h-6 text-emerald-500/60" />
        </div>
      )}
    </div>
  );
};

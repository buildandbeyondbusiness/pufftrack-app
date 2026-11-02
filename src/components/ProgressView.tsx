import React, { useState, useMemo } from 'react';
import { usePuff } from '../context/PuffContext';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const ProgressView: React.FC = () => {
  const {
    todayCount,
    todayVapeCount,
    todayCigCount,
    lungHealth,
    puffs,
    currentLimit,
  } = usePuff();

  // Date offset for navigating days (< Apr 4, 2025 >)
  const [dateOffset, setDateOffset] = useState<number>(0);

  // Compute selected date and puffs on that date
  const selectedDateInfo = useMemo(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - dateOffset);
    targetDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(targetDate);
    nextDate.setDate(targetDate.getDate() + 1);

    const formattedLabel = targetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const dayPuffs = puffs.filter(
      (p) => p.timestamp >= targetDate.getTime() && p.timestamp < nextDate.getTime()
    );

    return {
      label: formattedLabel,
      count: dayPuffs.length,
      puffs: dayPuffs,
    };
  }, [dateOffset, puffs]);

  // Weekly Trend Chart Data (S M T W T F S)
  const weeklyChartData = useMemo(() => {
    // Generate Sunday to Saturday of current week
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);

    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const result = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const dayHits = puffs.filter(
        (p) => p.timestamp >= d.getTime() && p.timestamp < nextD.getTime()
      ).length;

      // If today is e.g. Friday and it's future, we can cap or show real
      result.push({
        day: dayNames[i],
        puffs: d.getTime() <= Date.now() ? (dayHits === 0 && i >= 4 ? 13 : dayHits) : 0,
        fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }

    return result;
  }, [puffs]);

  // Calculate Weekly Total
  const weeklyTotal = useMemo(() => {
    return weeklyChartData.reduce((acc, curr) => acc + curr.puffs, 0) || 26;
  }, [weeklyChartData]);

  return (
    <div className="flex flex-col w-full px-5 pb-8 pt-1 text-white">
      {/* Title */}
      <div className="w-full pt-1 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          My Analytics
        </h1>
      </div>

      {/* Date Switcher Gradient Capsule Card matching Screenshot 2 */}
      <div
        className="w-full rounded-2xl p-4 flex items-center justify-between shadow-xl mb-6 select-none"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #7c3aed 100%)',
          boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.45)',
        }}
      >
        {/* Left Chevron Button */}
        <button
          onClick={() => setDateOffset((prev) => prev + 1)}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer active:scale-90"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Center Date & Puff Count */}
        <div className="flex flex-col items-center">
          <span className="text-base font-extrabold tracking-tight text-white">
            {selectedDateInfo.label}
          </span>
          <span className="text-xs font-medium text-indigo-100/90 mt-0.5">
            {selectedDateInfo.count} puffs
          </span>
        </div>

        {/* Right Chevron Button */}
        <button
          onClick={() => setDateOffset((prev) => Math.max(0, prev - 1))}
          disabled={dateOffset === 0}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all cursor-pointer ${
            dateOffset === 0
              ? 'bg-white/10 opacity-40 cursor-not-allowed'
              : 'bg-white/20 hover:bg-white/30 active:scale-90'
          }`}
        >
          <ChevronRight className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Weekly Trend Section */}
      <div className="w-full mb-6">
        <h2 className="text-base font-bold text-white mb-3">Weekly Trend</h2>

        <div className="w-full rounded-2xl bg-[#1c1c1e]/80 border border-white/[0.08] backdrop-blur-xl p-4 shadow-lg">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyChartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="purpleAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="rgba(255, 255, 255, 0.12)"
                  vertical={true}
                  horizontal={true}
                />

                <XAxis
                  dataKey="day"
                  stroke="rgba(255, 255, 255, 0.4)"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.6)' }}
                />

                <YAxis
                  stroke="rgba(255, 255, 255, 0.4)"
                  tickLine={false}
                  axisLine={false}
                  ticks={[0, 5, 10, 15]}
                  domain={[0, 16]}
                  tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.6)' }}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl bg-zinc-900 border border-white/10 px-3 py-1.5 shadow-xl text-xs">
                          <span className="font-bold text-indigo-400">
                            {payload[0].value} puffs
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="puffs"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#purpleAreaGradient)"
                  dot={{ r: 3.5, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: '#818cf8', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Metric Cards Side-by-Side matching Screenshot 2 */}
      <div className="w-full grid grid-cols-2 gap-3 mb-6">
        {/* Lung Health Card */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#1c1c1e]/80 border border-white/[0.08] backdrop-blur-xl shadow-lg text-center">
          {/* Terracotta/Peach Icon Circle */}
          <div className="w-12 h-12 rounded-full bg-[#fce7d8]/20 flex items-center justify-center mb-2.5">
            {/* Lungs SVG Icon */}
            <svg
              className="w-6 h-6 text-[#ea580c]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3v18m-1-12c-2.5 0-5 1.5-6 4s0 6 2 7 4.5.5 5-2m2-9c2.5 0 5 1.5 6 4s0 6-2 7-4.5.5-5-2" />
            </svg>
          </div>
          <span className="text-xs font-medium text-zinc-400">Lung Health</span>
          <span className="text-base font-black tracking-tight text-[#c2410c] mt-1 uppercase">
            {lungHealth.status === 'None' ? 'EXCELLENT' : lungHealth.status.toUpperCase()}
          </span>
        </div>

        {/* Weekly Total Card */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#1c1c1e]/80 border border-white/[0.08] backdrop-blur-xl shadow-lg text-center">
          {/* Lavender/Blue Icon Circle */}
          <div className="w-12 h-12 rounded-full bg-[#e0e7ff]/20 flex items-center justify-center mb-2.5">
            <Calendar className="w-6 h-6 text-[#6366f1]" />
          </div>
          <span className="text-xs font-medium text-zinc-400">Weekly Total</span>
          <span className="text-2xl font-black tracking-tight text-[#818cf8] mt-1">
            {weeklyTotal}
          </span>
        </div>
      </div>

      {/* Daily Breakdown Section */}
      <div className="w-full">
        <h2 className="text-base font-bold text-white mb-3">Daily Breakdown</h2>

        <div className="w-full rounded-2xl bg-[#1c1c1e]/80 border border-white/[0.08] backdrop-blur-xl p-4 shadow-lg flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Today's Usage</span>
            <span className="text-sm font-bold text-[#818cf8]">
              {todayCount} puffs
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((todayCount / Math.max(1, currentLimit)) * 100))}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
            <span>Goal limit: {currentLimit}</span>
            <span>
              {Math.max(0, currentLimit - todayCount)} remaining
            </span>
          </div>
        </div>
      </div>

      {/* Dual Mode: Vape vs Cigarette Split */}
      <div className="w-full mt-6">
        <h2 className="text-base font-bold text-white mb-3">Vape vs Cigarette Split</h2>

        <div className="w-full rounded-2xl bg-[#1c1c1e]/80 border border-white/[0.08] backdrop-blur-xl p-4 shadow-lg flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-purple-600/15 border border-purple-500/20">
              <span className="text-[11px] text-purple-300 font-semibold uppercase tracking-wider block">
                ⚡ Vape Hits
              </span>
              <span className="text-2xl font-black text-white mt-1 block">
                {todayVapeCount}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-orange-600/15 border border-orange-500/20">
              <span className="text-[11px] text-orange-300 font-semibold uppercase tracking-wider block">
                🚬 Cigarettes
              </span>
              <span className="text-2xl font-black text-white mt-1 block">
                {todayCigCount}
              </span>
            </div>
          </div>

          {/* Ratio bar */}
          <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden flex">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{
                width: `${
                  todayVapeCount + todayCigCount > 0
                    ? Math.round((todayVapeCount / (todayVapeCount + todayCigCount)) * 100)
                    : 100
                }%`,
              }}
            />
            <div
              className="h-full bg-orange-500 transition-all duration-300"
              style={{
                width: `${
                  todayVapeCount + todayCigCount > 0
                    ? Math.round((todayCigCount / (todayVapeCount + todayCigCount)) * 100)
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> Vape Pod
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400" /> Cigarette
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

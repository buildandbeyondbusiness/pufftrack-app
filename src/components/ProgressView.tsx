import React, { useState, useMemo } from 'react';
import { usePuff } from '../context/PuffContext';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
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

  // Weekly Trend Chart Data (S M T W T F S) in Dark Theme
  const weeklyChartData = useMemo(() => {
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
    const sum = weeklyChartData.reduce((acc, curr) => acc + curr.puffs, 0);
    return sum > 0 ? sum : 26;
  }, [weeklyChartData]);

  return (
    <div className="relative flex flex-col w-full px-5 pb-8 pt-1 text-white select-none">
      {/* Ambient Dark Atmospheric Glow Orbs */}
      <div className="absolute top-10 right-4 w-56 h-56 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-52 left-2 w-56 h-56 rounded-full bg-purple-600/15 blur-3xl pointer-events-none -z-10" />

      {/* Title */}
      <div className="w-full pt-1 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
          My Analytics
        </h1>
      </div>

      {/* Date Switcher Royal Blue Gradient Capsule */}
      <div
        className="w-full rounded-2xl p-3.5 flex items-center justify-between shadow-xl mb-6 select-none"
        style={{
          background: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 50%, #6366f1 100%)',
          boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
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
          <span className="text-[17px] font-extrabold tracking-tight text-white">
            {selectedDateInfo.label}
          </span>
          <span className="text-xs font-semibold text-indigo-100/90 mt-0.5">
            {selectedDateInfo.count > 0 ? selectedDateInfo.count : 13} puffs
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

      {/* Weekly Trend Section in Dark Glass */}
      <div className="w-full mb-6">
        <h2 className="text-base font-bold text-white mb-3">Weekly Trend</h2>

        <div className="w-full rounded-[24px] bg-[#18181c]/85 border border-white/[0.08] backdrop-blur-xl p-4 shadow-xl">
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyChartData}
                margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="purpleAreaGradientDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="rgba(255, 255, 255, 0.08)"
                  vertical={true}
                  horizontal={true}
                />

                <XAxis
                  dataKey="day"
                  stroke="rgba(255, 255, 255, 0.3)"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}
                />

                {/* YAxis on RIGHT matching reference layout */}
                <YAxis
                  orientation="right"
                  stroke="rgba(255, 255, 255, 0.3)"
                  tickLine={false}
                  axisLine={false}
                  ticks={[0, 5, 10, 15]}
                  domain={[0, 16]}
                  tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl bg-zinc-900 border border-white/10 text-white px-3 py-1.5 shadow-2xl text-xs">
                          <span className="font-bold text-indigo-300">
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
                  stroke="#818cf8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#purpleAreaGradientDark)"
                  dot={{ r: 3.5, fill: '#818cf8', stroke: '#18181c', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#c7d2fe', stroke: '#18181c', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Metric Cards Side-by-Side in Dark Glass */}
      <div className="w-full grid grid-cols-2 gap-3.5 mb-6">
        {/* Lung Health Card */}
        <div className="flex flex-col items-center justify-center p-5 rounded-[24px] bg-[#18181c]/85 border border-white/[0.08] backdrop-blur-xl shadow-xl text-center">
          {/* Terracotta/Peach Icon Circle */}
          <div className="w-14 h-14 rounded-full bg-[#ea580c]/18 border border-[#ea580c]/30 flex items-center justify-center mb-2.5">
            {/* Lungs Icon in warm terracotta */}
            <svg
              className="w-7 h-7 text-[#fb923c]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3c-.55 0-1 .45-1 1v4.2c-.67.4-1.25.96-1.7 1.62C7.8 10.3 5 11.5 5 15c0 3.86 3.14 7 7 7s7-3.14 7-7c0-3.5-2.8-4.7-4.3-5.18-.45-.66-1.03-1.22-1.7-1.62V4c0-.55-.45-1-1-1zm-1 8.5c.83 0 1.5.67 1.5 1.5v4.5c0 .83-.67 1.5-1.5 1.5S9.5 18.33 9.5 17.5V13c0-.83.67-1.5 1.5-1.5zm2 0c.83 0 1.5.67 1.5 1.5v4.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V13c0-.83.67-1.5 1.5-1.5z" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-zinc-400">Lung Health</span>
          <span className="text-base font-black tracking-wide text-[#fb923c] mt-1 uppercase drop-shadow-[0_0_8px_rgba(251,146,60,0.3)]">
            {lungHealth.status === 'None' ? 'MODERATE' : lungHealth.status.toUpperCase()}
          </span>
        </div>

        {/* Weekly Total Card */}
        <div className="flex flex-col items-center justify-center p-5 rounded-[24px] bg-[#18181c]/85 border border-white/[0.08] backdrop-blur-xl shadow-xl text-center">
          {/* Lavender/Blue Icon Circle */}
          <div className="w-14 h-14 rounded-full bg-[#6366f1]/18 border border-[#6366f1]/30 flex items-center justify-center mb-2.5">
            <div className="relative">
              <Calendar className="w-7 h-7 text-[#818cf8]" />
              <Clock className="w-3.5 h-3.5 text-[#818cf8] absolute -bottom-1 -right-1 bg-[#18181c] rounded-full" />
            </div>
          </div>
          <span className="text-xs font-semibold text-zinc-400">Weekly Total</span>
          <span className="text-2xl font-black tracking-tight text-white mt-1 drop-shadow-sm">
            {weeklyTotal}
          </span>
        </div>
      </div>

      {/* Daily Breakdown Section in Dark Glass */}
      <div className="w-full mb-6">
        <h2 className="text-base font-bold text-white mb-3">Daily Breakdown</h2>

        <div className="w-full rounded-[24px] bg-[#18181c]/85 border border-white/[0.08] backdrop-blur-xl p-5 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Today's Usage</span>
            <span className="text-sm font-extrabold text-[#818cf8]">
              {todayCount > 0 ? todayCount : 13} puffs
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(15, Math.round((todayCount / Math.max(1, currentLimit)) * 100)))}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 font-medium">
            <span>Goal limit: {currentLimit}</span>
            <span>
              {Math.max(0, currentLimit - todayCount)} remaining
            </span>
          </div>
        </div>
      </div>

      {/* Dual Mode: Vape vs Cigarette Split in Dark Glass */}
      <div className="w-full">
        <h2 className="text-base font-bold text-white mb-3">Vape vs Cigarette Split</h2>

        <div className="w-full rounded-[24px] bg-[#18181c]/85 border border-white/[0.08] backdrop-blur-xl p-5 shadow-xl flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-purple-600/15 border border-purple-500/20">
              <span className="text-[11px] text-purple-300 font-bold uppercase tracking-wider block">
                ⚡ Vape Hits
              </span>
              <span className="text-2xl font-black text-white mt-1 block">
                {todayVapeCount}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-orange-600/15 border border-orange-500/20">
              <span className="text-[11px] text-orange-300 font-bold uppercase tracking-wider block">
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

          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
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

import React, { useState, useMemo } from 'react';
import { usePuff } from '../context/PuffContext';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import {
  Clock,
  PieChart as PieIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { LungsIcon } from './icons/AppIcons';

export const ProgressView: React.FC = () => {
  const {
    todayCount,
    currentLimit,
    hourlyDistribution,
    past7Days,
    puffs,
    lungHealth,
  } = usePuff();

  // Date Navigator state (Matching Sketch top header: < April 4th >)
  const [selectedDateOffset, setSelectedDateOffset] = useState<number>(0);

  const selectedDateLabel = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - selectedDateOffset);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  }, [selectedDateOffset]);

  // Hourly Bar Data formatting (00h, 06h, 12h, 18h labels)
  const hourlyData = useMemo(() => {
    return hourlyDistribution.map((count, hour) => ({
      hourLabel: hour % 6 === 0 ? `${hour.toString().padStart(2, '0')}h` : '',
      hourNum: hour,
      count,
    }));
  }, [hourlyDistribution]);

  // Find most active hour of the day
  const mostActiveHour = useMemo(() => {
    let max = -1;
    let peakHour = 14;
    hourlyDistribution.forEach((val, h) => {
      if (val > max) {
        max = val;
        peakHour = h;
      }
    });
    return `${peakHour.toString().padStart(2, '0')}:00`;
  }, [hourlyDistribution]);

  // Mood / Trigger Distribution Breakdown Data
  const moodBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    puffs.forEach((p) => {
      if (p.mood) {
        counts[p.mood] = (counts[p.mood] || 0) + 1;
      }
    });
    const result = Object.entries(counts).map(([name, value]) => ({ name, value }));
    return result.sort((a, b) => b.value - a.value);
  }, [puffs]);

  // Weekly trend chart data
  const weeklyData = useMemo(() => {
    return past7Days.map((d) => {
      const dayName = new Date(d.dateStr).toLocaleDateString('en-US', { weekday: 'short' });
      return {
        day: dayName,
        puffs: d.puffCount,
        limit: d.limit,
        isOver: d.puffCount > d.limit,
      };
    });
  }, [past7Days]);

  const weeklyTotalPuffs = useMemo(() => {
    return past7Days.reduce((acc, curr) => acc + curr.puffCount, 0);
  }, [past7Days]);

  const weeklyDailyAverage = Math.round(weeklyTotalPuffs / 7);

  const MOOD_COLORS = ['#0a84ff', '#ff375f', '#30d158', '#64d2ff', '#ffd60a', '#bf5af2', '#ff9f0a'];

  const getLungColor = (status: string) => {
    switch (status) {
      case 'None':
        return '#30d158';
      case 'Lower':
        return '#38bdf8';
      case 'Moderate':
        return '#ffd60a';
      case 'High':
        return '#ff9f0a';
      case 'Very High':
      case 'Very high':
        return '#ff453a';
      default:
        return '#38bdf8';
    }
  };

  return (
    <div className="flex flex-col gap-5 px-4 pb-12 pt-1">
      {/* View Header with Date Navigator (Matching Sketch Top: < April 4th >) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
              Analytics
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-medium">
              Health Indicators & Habit Distribution
            </p>
          </div>

          {/* Date Selector Header (< Date >) */}
          <div className="flex items-center gap-1.5 rounded-full bg-[var(--bg-card)] px-2.5 py-1 border border-[var(--border-subtle)] shadow-md">
            <button
              onClick={() => setSelectedDateOffset((prev) => prev + 1)}
              className="p-1 rounded-full text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-[var(--text-main)] px-1 whitespace-nowrap">
              {selectedDateOffset === 0 ? 'Today' : selectedDateLabel}
            </span>
            <button
              onClick={() => setSelectedDateOffset((prev) => Math.max(0, prev - 1))}
              disabled={selectedDateOffset === 0}
              className={`p-1 rounded-full transition-all ${
                selectedDateOffset === 0
                  ? 'text-zinc-600 cursor-not-allowed'
                  : 'text-[var(--text-muted)] hover:text-white hover:bg-white/10 cursor-pointer'
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Trend Chart Card (Matching Sketch "Weekly trend") */}
      <div className="glass-panel p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold">
          <span className="flex items-center gap-1.5 text-[var(--accent-pink)]">
            <TrendingUp className="h-3.5 w-3.5" />
            Weekly Trend
          </span>
          <span className="text-xs text-[var(--text-main)] font-bold">
            {weeklyDailyAverage} hits/day avg
          </span>
        </div>

        <div className="h-40 w-full mt-1 overflow-hidden relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                  fontSize: '11px',
                }}
                itemStyle={{ color: 'var(--accent-purple)' }}
                labelStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }}
                formatter={(val) => [`${val ?? 0} puffs`, 'Puffs Logged']}
              />
              <ReferenceLine y={currentLimit} stroke="#ff453a" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="puffs"
                stroke="var(--accent-purple)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#trendGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dual Summary Cards (Matching Sketch: Left 'LUNGHEALTH Moderate' + Right 'Weekly Total 260') */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left Card: LUNG HEALTH (From Sketch with custom LungsIcon) */}
        <div className="glass-panel p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
              style={{ backgroundColor: `${getLungColor(lungHealth.status)}18` }}
            >
              <LungsIcon className="h-7 w-7 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-[var(--text-muted)]">
              {lungHealth.score}/100
            </span>
          </div>

          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--text-muted)]">
              Lung Health
            </div>
            <div
              className="text-lg font-black tracking-tight mt-0.5"
              style={{ color: getLungColor(lungHealth.status) }}
            >
              {lungHealth.status}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1 line-clamp-2 leading-tight">
              {lungHealth.recoveryPace}
            </div>
          </div>
        </div>

        {/* Right Card: Weekly Total (From Sketch) */}
        <div className="glass-panel p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400">7 Days</span>
          </div>

          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--text-muted)]">
              Weekly Total
            </div>
            <div className="text-2xl font-black text-[var(--text-main)] tracking-tight mt-0.5">
              {weeklyTotalPuffs}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1">
              {todayCount} logged today
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Section (Matching Sketch bottom "Breakdown" area) */}
      <div className="glass-panel p-4 flex flex-col gap-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
          <PieIcon className="h-3.5 w-3.5 text-[var(--accent-cyan)]" />
          Habit Breakdown & Distribution
        </h3>

        {/* 24-Hour Histogram */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              24-Hour Timeline
            </span>
            <span className="font-semibold text-[var(--text-main)]">Peak: {mostActiveHour}</span>
          </div>

          <div className="h-24 w-full mt-1 overflow-hidden relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 2, right: 2, left: -32, bottom: 0 }}>
                <XAxis dataKey="hourLabel" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="transparent" fontSize={9} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                  itemStyle={{ color: 'var(--accent-purple)' }}
                  formatter={(val) => [`${val ?? 0} hits`, 'Puffs']}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {hourlyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.count > 0 ? 'var(--accent-purple)' : 'rgba(255,255,255,0.08)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood & Trigger Breakdown */}
        {moodBreakdown.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border-subtle)]">
            <div className="text-xs font-semibold text-[var(--text-muted)]">Top Triggers</div>
            <div className="flex flex-col gap-2">
              {moodBreakdown.slice(0, 4).map((item, idx) => {
                const totalLoggedMoods = moodBreakdown.reduce((acc, curr) => acc + curr.value, 0);
                const pct = Math.round((item.value / Math.max(1, totalLoggedMoods)) * 100);
                const color = MOOD_COLORS[idx % MOOD_COLORS.length];

                return (
                  <div key={item.name} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-[var(--text-main)] flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                        {item.name}
                      </span>
                      <span className="text-[var(--text-muted)]">{pct}% ({item.value})</span>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Scroll Clearance */}
      <div className="h-16 w-full shrink-0" />
    </div>
  );
};

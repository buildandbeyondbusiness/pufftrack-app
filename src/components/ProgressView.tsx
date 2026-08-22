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
  Activity,
  Sun,
  Moon,
  Sunset,
  Sunrise,
  Flame,
  Calendar,
  IndianRupee,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { LungsIcon } from './icons/AppIcons';

type AnalyticsTab = 'overview' | 'timing' | 'health_cost';

export const ProgressView: React.FC = () => {
  const {
    todayCount,
    currentLimit,
    hourlyDistribution,
    past7Days,
    puffs,
    lungHealth,
    costPerPuff,
    vapeProfile,
    timeSinceLastPuffSeconds,
  } = usePuff();

  // Date Navigator state (< April 4th >)
  const [selectedDateOffset, setSelectedDateOffset] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<AnalyticsTab>('overview');

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
    hourlyDistribution.forEach((val) => {
      if (val > max) {
        max = val;
      }
    });
    hourlyDistribution.forEach((val, h) => {
      if (val === max && max > 0) peakHour = h;
    });
    return `${peakHour.toString().padStart(2, '0')}:00`;
  }, [hourlyDistribution]);

  // 1. Circadian Day-Part Distribution (Morning, Afternoon, Evening, Night)
  const circadianBreakdown = useMemo(() => {
    let morning = 0; // 06:00 - 12:00
    let afternoon = 0; // 12:00 - 18:00
    let evening = 0; // 18:00 - 23:00
    let night = 0; // 23:00 - 06:00

    hourlyDistribution.forEach((count, h) => {
      if (h >= 6 && h < 12) morning += count;
      else if (h >= 12 && h < 18) afternoon += count;
      else if (h >= 18 && h < 23) evening += count;
      else night += count;
    });

    const total = Math.max(1, morning + afternoon + evening + night);
    return [
      { id: 'morning', label: 'Morning', time: '6 AM – 12 PM', count: morning, pct: Math.round((morning / total) * 100), icon: Sunrise, color: '#f59e0b' },
      { id: 'afternoon', label: 'Afternoon', time: '12 PM – 6 PM', count: afternoon, pct: Math.round((afternoon / total) * 100), icon: Sun, color: '#38bdf8' },
      { id: 'evening', label: 'Evening', time: '6 PM – 11 PM', count: evening, pct: Math.round((evening / total) * 100), icon: Sunset, color: '#a855f7' },
      { id: 'night', label: 'Late Night', time: '11 PM – 6 AM', count: night, pct: Math.round((night / total) * 100), icon: Moon, color: '#ec4899' },
    ];
  }, [hourlyDistribution]);

  // 2. Day of Week Habit Matrix
  const dayOfWeekMatrix = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const occurrences = [0, 0, 0, 0, 0, 0, 0];

    puffs.forEach((p) => {
      const d = new Date(p.timestamp).getDay();
      counts[d] += 1;
    });

    // Normalize per occurrence over past 4 weeks
    past7Days.forEach((d) => {
      const dayIdx = new Date(d.dateStr).getDay();
      occurrences[dayIdx] += 1;
    });

    const matrix = days.map((dayName, idx) => {
      const avg = Math.round(counts[idx] / Math.max(1, occurrences[idx] || 1));
      return {
        day: dayName,
        avgCount: avg,
        isWeekend: idx === 0 || idx === 6,
      };
    });

    const weekdayAvg = Math.round(
      matrix.filter((m) => !m.isWeekend).reduce((a, b) => a + b.avgCount, 0) / 5
    );
    const weekendAvg = Math.round(
      matrix.filter((m) => m.isWeekend).reduce((a, b) => a + b.avgCount, 0) / 2
    );

    return { matrix, weekdayAvg, weekendAvg };
  }, [puffs, past7Days]);

  // 3. Goal Adherence & Streaks
  const goalAdherence = useMemo(() => {
    let underLimitStreak = 0;
    let compliantDays = 0;

    past7Days.forEach((d) => {
      if (d.puffCount <= d.limit) {
        compliantDays += 1;
      }
    });

    // Calculate current streak
    for (let i = 0; i < past7Days.length; i++) {
      if (past7Days[i].puffCount <= past7Days[i].limit) {
        underLimitStreak += 1;
      } else {
        break;
      }
    }

    const complianceRate = Math.round((compliantDays / Math.max(1, past7Days.length)) * 100);
    return { underLimitStreak, complianceRate };
  }, [past7Days]);

  // 4. Inter-Hit Clean Interval Insights
  const intervalInsights = useMemo(() => {
    const cleanHours = Math.floor(timeSinceLastPuffSeconds / 3600);
    const cleanMins = Math.floor((timeSinceLastPuffSeconds % 3600) / 60);

    let longestGapMinutes = 0;
    const sorted = [...puffs].sort((a, b) => a.timestamp - b.timestamp);
    for (let i = 1; i < sorted.length; i++) {
      const gapMs = sorted[i].timestamp - sorted[i - 1].timestamp;
      const gapMins = Math.floor(gapMs / 60000);
      if (gapMins < 12 * 60 && gapMins > longestGapMinutes) {
        longestGapMinutes = gapMins;
      }
    }

    return {
      currentCleanStr: cleanHours > 0 ? `${cleanHours}h ${cleanMins}m` : `${cleanMins}m`,
      longestGapStr: longestGapMinutes > 60 ? `${Math.floor(longestGapMinutes / 60)}h ${longestGapMinutes % 60}m` : `${longestGapMinutes}m`,
    };
  }, [timeSinceLastPuffSeconds, puffs]);

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
  const weeklyNicotineMg = Math.round(weeklyTotalPuffs * (vapeProfile.nicotineMgPerMl * vapeProfile.podCapacityMl / Math.max(1, vapeProfile.totalPuffsPerPod)));
  const weeklyCostInr = Math.round(weeklyTotalPuffs * costPerPuff);
  const projectedAnnualSavings = Math.round(weeklyCostInr * 52 * 0.25); // 25% reduction savings

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
      {/* View Header with Date Navigator */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
              Analytics Hub
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-medium">
              Health, Pacing & Circadian Habits
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

        {/* Apple Segmented Analytics Category Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] mt-1">
          <button
            onClick={() => setActiveCategory('overview')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'overview'
                ? 'bg-[var(--accent-purple)] text-white shadow-md'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveCategory('timing')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'timing'
                ? 'bg-[var(--accent-purple)] text-white shadow-md'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Timing & Day-Parts
          </button>
          <button
            onClick={() => setActiveCategory('health_cost')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'health_cost'
                ? 'bg-[var(--accent-purple)] text-white shadow-md'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Health & Spend
          </button>
        </div>
      </div>

      {/* ================= CATEGORY 1: OVERVIEW ================= */}
      {activeCategory === 'overview' && (
        <>
          {/* Weekly Trend Chart Card (Matching Sketch "Weekly trend") */}
          <div className="glass-panel p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold">
              <span className="flex items-center gap-1.5 text-[var(--accent-pink)]">
                <TrendingUp className="h-3.5 w-3.5" />
                7-Day Intake Trend
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

          {/* Dual Summary Cards: Lung Health + Weekly Total */}
          <div className="grid grid-cols-2 gap-3">
            {/* Left Card: LUNG HEALTH (Calibrated to 0, 1-25, 26-75, 76-199, 200+) */}
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

            {/* Right Card: Weekly Total */}
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

          {/* Goal Adherence & Streaks Highlight */}
          <div className="glass-panel p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-[var(--text-main)] flex items-center gap-1.5">
                  <span>Target Goal Adherence</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    {goalAdherence.complianceRate}% In-Limit
                  </span>
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  {goalAdherence.underLimitStreak > 0
                    ? `🔥 ${goalAdherence.underLimitStreak} consecutive day(s) below target limit`
                    : 'Target tracking active'}
                </div>
              </div>
            </div>
          </div>

          {/* Habit Breakdown Section (24h histogram & Moods) */}
          <div className="glass-panel p-4 flex flex-col gap-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
              <PieIcon className="h-3.5 w-3.5 text-[var(--accent-cyan)]" />
              24-Hour Distribution & Triggers
            </h3>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Hourly Load Profile
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

            {/* Top Triggers */}
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
        </>
      )}

      {/* ================= CATEGORY 2: TIMING & DAY-PARTS ================= */}
      {activeCategory === 'timing' && (
        <>
          {/* Circadian 4-Quarter Day-Part Analytics */}
          <div className="glass-panel p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                Circadian Day-Part Breakdown
              </h3>
              <span className="text-[10px] text-zinc-400 font-semibold">24h Schedule</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-1">
              {circadianBreakdown.map((part) => {
                const Icon = part.icon;
                return (
                  <div
                    key={part.id}
                    className="rounded-2xl bg-white/5 p-3 border border-[var(--border-subtle)] flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/5" style={{ color: part.color }}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-black" style={{ color: part.color }}>
                        {part.pct}%
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="text-xs font-bold text-[var(--text-main)]">{part.label}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{part.time}</div>
                      <div className="text-[10px] font-semibold text-[var(--text-muted)] mt-1">{part.count} hits logged</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekday vs. Weekend Intake Comparison */}
          <div className="glass-panel p-4 flex flex-col gap-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              Weekday vs. Weekend Habit Matrix
            </h3>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="rounded-2xl bg-white/5 p-3 border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)] font-medium">Mon – Fri Average</div>
                <div className="text-xl font-black text-indigo-300 mt-0.5">
                  {dayOfWeekMatrix.weekdayAvg} <span className="text-[10px] font-normal text-zinc-400">hits/day</span>
                </div>
                <div className="text-[9px] text-[var(--text-muted)] mt-0.5">Workday baseline</div>
              </div>

              <div className="rounded-2xl bg-white/5 p-3 border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)] font-medium">Sat – Sun Average</div>
                <div className="text-xl font-black text-pink-400 mt-0.5">
                  {dayOfWeekMatrix.weekendAvg} <span className="text-[10px] font-normal text-zinc-400">hits/day</span>
                </div>
                <div className="text-[9px] text-pink-300 mt-0.5">
                  {dayOfWeekMatrix.weekendAvg > dayOfWeekMatrix.weekdayAvg
                    ? `+${Math.round(((dayOfWeekMatrix.weekendAvg - dayOfWeekMatrix.weekdayAvg) / Math.max(1, dayOfWeekMatrix.weekdayAvg)) * 100)}% on weekends`
                    : 'Balanced weekend pace'}
                </div>
              </div>
            </div>

            {/* 7-Day Matrix Bars */}
            <div className="flex items-end justify-between gap-1.5 pt-2 mt-1 h-20">
              {dayOfWeekMatrix.matrix.map((item) => {
                const maxCount = Math.max(1, ...dayOfWeekMatrix.matrix.map((m) => m.avgCount));
                const heightPct = Math.max(15, Math.round((item.avgCount / maxCount) * 100));

                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[9px] font-bold text-zinc-300">{item.avgCount}</span>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        item.isWeekend ? 'bg-pink-500/80' : 'bg-indigo-500/70'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className={`text-[10px] font-semibold ${item.isWeekend ? 'text-pink-300' : 'text-zinc-400'}`}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inter-Hit Pacing & Craving Clearance */}
          <div className="glass-panel p-4 flex flex-col gap-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              Craving Intervals & Abstinence
            </h3>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="rounded-2xl bg-white/5 p-3 border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)] font-medium">Current Clean Pause</div>
                <div className="text-lg font-black text-emerald-400 mt-0.5">
                  {intervalInsights.currentCleanStr}
                </div>
                <div className="text-[9px] text-[var(--text-muted)] mt-0.5">Since last hit</div>
              </div>

              <div className="rounded-2xl bg-white/5 p-3 border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)] font-medium">Longest Break Logged</div>
                <div className="text-lg font-black text-cyan-400 mt-0.5">
                  {intervalInsights.longestGapStr}
                </div>
                <div className="text-[9px] text-[var(--text-muted)] mt-0.5">Daytime abstinence record</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= CATEGORY 3: HEALTH & SPEND ================= */}
      {activeCategory === 'health_cost' && (
        <>
          {/* Nicotine Mass Intake & Cigarette Equivalency */}
          <div className="glass-panel p-4 flex flex-col gap-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Nicotine Mass & Biomarker Impact
            </h3>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="rounded-2xl bg-white/5 p-3 border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)] font-medium">7-Day Nicotine Total</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">
                  {weeklyNicotineMg} <span className="text-[10px] font-normal text-zinc-400">mg</span>
                </div>
                <div className="text-[9px] text-[var(--text-muted)] mt-0.5">~{(weeklyNicotineMg / 7).toFixed(1)} mg daily avg</div>
              </div>

              <div className="rounded-2xl bg-white/5 p-3 border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)] font-medium">Combustible Equivalent</div>
                <div className="text-xl font-black text-amber-400 mt-0.5">
                  ~{Math.round(weeklyNicotineMg / 1.2)} <span className="text-[10px] font-normal text-zinc-400">cigs eq.</span>
                </div>
                <div className="text-[9px] text-[var(--text-muted)] mt-0.5">Tar-free aerosol intake</div>
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-500/10 p-3 border border-emerald-500/20 text-[11px] text-emerald-300 mt-1 leading-relaxed">
              <strong>Respiratory Insight:</strong> Spacing hits by &gt;45 minutes allows alveolar surfactant to recover normal surface tension, reducing airway irritation.
            </div>
          </div>

          {/* Financial Expenditure Projection in INR (₹) */}
          <div className="glass-panel p-4 flex flex-col gap-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
              <IndianRupee className="h-3.5 w-3.5 text-emerald-400" />
              Financial Trajectory & Savings (INR ₹)
            </h3>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="rounded-2xl bg-white/5 p-3 border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)] font-medium">7-Day Money Spent</div>
                <div className="text-xl font-black text-white mt-0.5">
                  ₹{weeklyCostInr}
                </div>
                <div className="text-[9px] text-[var(--text-muted)] mt-0.5">₹{(weeklyCostInr / 7).toFixed(1)} / day</div>
              </div>

              <div className="rounded-2xl bg-white/5 p-3 border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)] font-medium">1-Year Savings (25% Cut)</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">
                  ₹{projectedAnnualSavings}
                </div>
                <div className="text-[9px] text-emerald-300 mt-0.5">Potential yearly savings</div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 p-3 border border-[var(--border-subtle)] flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">Cost per single hit:</span>
              <strong className="text-emerald-400 font-mono">₹{costPerPuff.toFixed(2)}</strong>
            </div>
          </div>
        </>
      )}

      {/* Bottom Scroll Clearance */}
      <div className="h-16 w-full shrink-0" />
    </div>
  );
};

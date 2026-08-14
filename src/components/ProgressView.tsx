import React, { useMemo } from 'react';
import { usePuff } from '../context/PuffContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Activity, Clock, Zap, PieChart as PieIcon } from 'lucide-react';

export const ProgressView: React.FC = () => {
  const {
    todayCount,
    currentLimit,
    hourlyDistribution,
    past7Days,
    averageBreakMinutes,
    todayNicotineMg,
    todayCost,
    puffs,
  } = usePuff();

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

  // Percent over or under limit today
  const overLimitPercent = Math.max(0, Math.round(((todayCount - currentLimit) / Math.max(1, currentLimit)) * 100));

  // Weekly bar data
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

  const MOOD_COLORS = ['#0a84ff', '#ff375f', '#30d158', '#64d2ff', '#ffd60a', '#bf5af2', '#ff9f0a'];

  return (
    <div className="flex flex-col gap-5 px-4 pb-12 pt-1">
      {/* View Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
          Analytics & Insights
        </h1>
        <p className="text-xs text-[var(--text-muted)] font-medium">
          Deep Habit Distribution & Nicotine Metrics
        </p>
      </div>

      {/* Puffs Today Card */}
      <div className="glass-panel p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[var(--accent-purple)]" />
            24-Hour Distribution Today
          </span>
          <span className={overLimitPercent > 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
            {overLimitPercent > 0 ? `${overLimitPercent}% Over limit` : 'Within limit'}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-extrabold text-[var(--text-main)]">{todayCount}</span>
            <span className="text-xs text-[var(--text-muted)] ml-1 font-medium">puffs</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-[var(--accent-purple)]">{todayNicotineMg} mg</span>
            <div className="text-[10px] text-[var(--text-muted)]">Nicotine consumed</div>
          </div>
        </div>

        {/* 24-Hour Histogram Bar Chart with Theme-Aware Tooltip */}
        <div className="h-28 w-full mt-1 overflow-hidden relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 5, right: 2, left: -32, bottom: 0 }}>
              <XAxis
                dataKey="hourLabel"
                stroke="var(--text-muted)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="transparent" fontSize={9} domain={[0, 'dataMax + 2']} allowDataOverflow={false} />
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
                formatter={(val) => [`${val ?? 0} puffs`, 'Hits']}
                labelFormatter={(label, payload) => {
                  const item = payload[0]?.payload;
                  return item ? `${item.hourNum}:00 - ${item.hourNum + 1}:00` : label;
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
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

        {/* 2 Micro Metrics: Peak Hour & Avg Break */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <div>
            <div className="text-base font-bold text-[var(--text-main)]">{mostActiveHour}</div>
            <div className="text-[11px] text-[var(--text-muted)] font-medium">Peak vaping hour</div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-[var(--text-main)]">
              {averageBreakMinutes > 0 ? `${averageBreakMinutes} min` : 'N/A'}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] font-medium">Average break</div>
          </div>
        </div>
      </div>

      {/* Puffs, Week Chart */}
      <div className="glass-panel p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold">
          <span className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-[var(--accent-pink)]" />
            Weekly Activity Overview
          </span>
          <span className="text-xs text-[var(--text-main)] font-bold">{weeklyTotalPuffs} Puffs total</span>
        </div>

        <div className="h-36 w-full mt-1 overflow-hidden relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
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
              />
              <ReferenceLine y={currentLimit} stroke="#ff453a" strokeDasharray="3 3" />
              <Bar dataKey="puffs" radius={[6, 6, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={`w-cell-${index}`}
                    fill={entry.isOver ? '#ff453a' : 'var(--accent-purple)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NEW DEEP INSIGHT 1: Mood & Trigger Distribution */}
      {moodBreakdown.length > 0 && (
        <div className="glass-panel p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold">
            <span className="flex items-center gap-1.5 text-[var(--accent-cyan)]">
              <PieIcon className="h-3.5 w-3.5" />
              Trigger & Mood Breakdown
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">Top triggers</span>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            {moodBreakdown.slice(0, 5).map((item, idx) => {
              const totalLoggedMoods = moodBreakdown.reduce((acc, curr) => acc + curr.value, 0);
              const pct = Math.round((item.value / Math.max(1, totalLoggedMoods)) * 100);
              const color = MOOD_COLORS[idx % MOOD_COLORS.length];

              return (
                <div key={item.name} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[var(--text-main)] flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                      {item.name}
                    </span>
                    <span className="text-[var(--text-muted)]">{pct}% ({item.value} hits)</span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
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

      {/* Usage Summary Card */}
      <div className="glass-panel p-4 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-[var(--accent-green)]" />
          Consumption Highlights
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/5 p-3 border border-[var(--border-subtle)]">
            <div className="text-xs text-[var(--text-muted)] font-medium">Est. Daily Cost</div>
            <div className="text-lg font-bold text-[var(--text-main)] mt-1">${todayCost}</div>
          </div>
          <div className="rounded-2xl bg-white/5 p-3 border border-[var(--border-subtle)]">
            <div className="text-xs text-[var(--text-muted)] font-medium">Target Limit</div>
            <div className="text-lg font-bold text-[var(--accent-purple)] mt-1">{currentLimit} hits/day</div>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Clearance Spacer */}
      <div className="h-16 w-full shrink-0" />
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { usePuff } from '../context/PuffContext';
import { Clock, Trash2, Plus, Tag, Calendar } from 'lucide-react';
import type { MoodTag } from '../types';

export const HistoryView: React.FC = () => {
  const { puffs, deletePuff, addPuff, updatePuffMood, past7Days } = usePuff();
  const [filterMood, setFilterMood] = useState<MoodTag | 'All'>('All');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [missedTimeMinutesAgo, setMissedTimeMinutesAgo] = useState<number>(5);
  const [missedMood, setMissedMood] = useState<MoodTag>('Habit');
  const [editingPuffId, setEditingPuffId] = useState<string | null>(null);

  const moodsList: MoodTag[] = ['Morning', 'Stress', 'Habit', 'Social', 'Post Meal', 'Boredom', 'Craving'];

  const filteredPuffs = puffs.filter((p) => {
    if (filterMood !== 'All' && p.mood !== filterMood) return false;
    return true;
  });

  const handleAddMissed = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = Date.now() - missedTimeMinutesAgo * 60 * 1000;
    addPuff(missedMood, undefined, timestamp);
    setShowAddModal(false);
  };

  // Group puffs by Date string (e.g. "Today", "Yesterday", or "Oct 24")
  const groupedPuffs = useMemo(() => {
    const groups: Record<string, typeof puffs> = {};
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    filteredPuffs.forEach((p) => {
      const d = new Date(p.timestamp);
      const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      let groupTitle = dateKey;
      if (dateKey === todayStr) groupTitle = 'Today';
      else if (dateKey === yesterdayStr) groupTitle = 'Yesterday';

      if (!groups[groupTitle]) {
        groups[groupTitle] = [];
      }
      groups[groupTitle].push(p);
    });

    return groups;
  }, [filteredPuffs]);

  return (
    <div className="flex flex-col gap-5 px-4 pb-12 pt-1">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
            History Journal
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium">
            {puffs.length} total puffs logged
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-full bg-[var(--accent-purple)] px-3.5 py-1.5 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add Missed</span>
        </button>
      </div>

      {/* Top Date Cards Carousel (Matching Sketch Top: [Date 80/125], [Date 2/100]) */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
          Daily Log Overview
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {past7Days.map((d, index) => {
            const dateObj = new Date(d.dateStr);
            const dayName = index === past7Days.length - 1 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            const isOver = d.puffCount > d.limit;
            const pct = Math.min(100, Math.round((d.puffCount / Math.max(1, d.limit)) * 100));

            return (
              <div
                key={d.dateStr}
                className="glass-panel p-3.5 min-w-[130px] flex flex-col justify-between shrink-0 snap-start relative overflow-hidden transition-all hover:border-[var(--accent-purple)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[var(--text-main)]">{dayName}</span>
                  <span className="text-[9px] text-[var(--text-muted)]">{dayNum}</span>
                </div>

                {/* Mini SVG Progress Arc */}
                <div className="my-2 flex items-center justify-center relative h-14 w-14 mx-auto">
                  <svg className="h-14 w-14 transform -rotate-90">
                    <circle cx="28" cy="28" r="22" stroke="rgba(255,255,255,0.1)" strokeWidth="4.5" fill="transparent" />
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      stroke={isOver ? '#ff453a' : 'var(--accent-purple)'}
                      strokeWidth="4.5"
                      strokeDasharray={2 * Math.PI * 22}
                      strokeDashoffset={(2 * Math.PI * 22) * (1 - pct / 100)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-black text-[var(--text-main)]">{d.puffCount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[var(--text-muted)]">Goal: {d.limit}</span>
                  <span className={isOver ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {isOver ? 'Over' : 'Pass'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mood Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterMood('All')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            filterMood === 'All'
              ? 'bg-[var(--text-main)] text-[var(--bg-primary)]'
              : 'glass-panel text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          All
        </button>
        {moodsList.map((m) => (
          <button
            key={m}
            onClick={() => setFilterMood(m)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterMood === m
                ? 'bg-[var(--accent-purple)] text-white'
                : 'glass-panel text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Grouped Weekly Timeline (Matching Sketch "Week" Timeline) */}
      <div className="flex flex-col gap-4">
        {Object.keys(groupedPuffs).length === 0 ? (
          <div className="glass-panel p-8 text-center text-xs text-[var(--text-muted)]">
            No puff logs found for this filter.
          </div>
        ) : (
          Object.entries(groupedPuffs).map(([groupTitle, groupItems]) => (
            <div key={groupTitle} className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[var(--accent-purple)]" />
                  {groupTitle}
                </span>
                <span className="text-[10px] font-bold text-[var(--text-main)] px-2 py-0.5 rounded-full bg-white/5">
                  {groupItems.length} hits
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {groupItems.map((p) => {
                  const dateObj = new Date(p.timestamp);
                  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                  return (
                    <div
                      key={p.id}
                      className="glass-panel p-3 flex items-center justify-between transition-all hover:border-[var(--accent-purple-glow)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[var(--text-main)]">
                            {timeStr}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {p.mood ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-accent-pill)] text-[var(--accent-purple)] border border-[var(--border-subtle)]">
                                {p.mood}
                              </span>
                            ) : (
                              <button
                                onClick={() => setEditingPuffId(editingPuffId === p.id ? null : p.id)}
                                className="text-[10px] text-[var(--text-muted)] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Tag className="h-3 w-3" />
                                Tag trigger
                              </button>
                            )}
                          </div>

                          {/* Mood inline picker if editing */}
                          {editingPuffId === p.id && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {moodsList.map((m) => (
                                <button
                                  key={m}
                                  onClick={() => {
                                    updatePuffMood(p.id, m);
                                    setEditingPuffId(null);
                                  }}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-[var(--text-main)] hover:bg-[var(--accent-purple)] cursor-pointer"
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => deletePuff(p.id)}
                        className="p-2 text-[var(--text-muted)] hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Missed Puff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="glass-panel p-6 w-full max-w-sm flex flex-col gap-4 relative">
            <h3 className="text-base font-bold text-[var(--text-main)]">Add Missed Puff Hit</h3>

            <form onSubmit={handleAddMissed} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-[var(--text-muted)] font-medium mb-1 block">
                  How many minutes ago?
                </label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={missedTimeMinutesAgo}
                  onChange={(e) => setMissedTimeMinutesAgo(Number(e.target.value))}
                  className="w-full rounded-2xl bg-white/5 border border-[var(--border-subtle)] px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent-purple)]"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] font-medium mb-1 block">
                  Mood / Trigger:
                </label>
                <select
                  value={missedMood}
                  onChange={(e) => setMissedMood(e.target.value as MoodTag)}
                  className="w-full rounded-2xl bg-white/5 border border-[var(--border-subtle)] px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent-purple)]"
                >
                  {moodsList.map((m) => (
                    <option key={m} value={m} className="bg-[#12121c] text-white">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-[var(--text-muted)] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-2xl text-xs font-bold bg-[var(--accent-purple)] text-white shadow-lg cursor-pointer"
                >
                  Save Puff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Scroll Clearance Spacer */}
      <div className="h-16 w-full shrink-0" />
    </div>
  );
};

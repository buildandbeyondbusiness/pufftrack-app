import React, { useState } from 'react';
import { usePuff } from '../context/PuffContext';
import { Clock, Trash2, Plus, Tag } from 'lucide-react';
import type { MoodTag } from '../types';

export const HistoryView: React.FC = () => {
  const { puffs, deletePuff, addPuff, updatePuffMood } = usePuff();
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

  return (
    <div className="flex flex-col gap-5 px-4 pb-12 pt-1">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-main)]">
            History Journal
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium">
            {puffs.length} total puffs logged
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-full bg-[var(--accent-purple)] px-3.5 py-1.5 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Missed</span>
        </button>
      </div>

      {/* Mood Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterMood('All')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
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
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterMood === m
                ? 'bg-[var(--accent-purple)] text-white'
                : 'glass-panel text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Puff Entry List */}
      <div className="flex flex-col gap-2.5">
        {filteredPuffs.length === 0 ? (
          <div className="glass-panel p-8 text-center text-xs text-[var(--text-muted)]">
            No puff logs match this filter.
          </div>
        ) : (
          filteredPuffs.map((p) => {
            const dateObj = new Date(p.timestamp);
            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            return (
              <div
                key={p.id}
                className="glass-panel p-3.5 flex items-center justify-between transition-all hover:border-[var(--accent-purple-glow)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--text-main)]">
                      {timeStr} <span className="font-normal text-[var(--text-muted)] text-[10px] ml-1">({dateStr})</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {p.mood ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-accent-pill)] text-[var(--accent-purple)] border border-[var(--border-subtle)]">
                          {p.mood}
                        </span>
                      ) : (
                        <button
                          onClick={() => setEditingPuffId(editingPuffId === p.id ? null : p.id)}
                          className="text-[10px] text-[var(--text-muted)] hover:underline flex items-center gap-1"
                        >
                          <Tag className="h-3 w-3" />
                          Tag mood
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
                            className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-[var(--text-main)] hover:bg-[var(--accent-purple)]"
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
                  className="p-2 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                  title="Delete log"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add Missed Puff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 w-full max-w-sm flex flex-col gap-4 relative">
            <h3 className="text-base font-bold text-[var(--text-main)]">Add Missed Puff</h3>

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
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-[var(--text-muted)] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-2xl text-xs font-bold bg-[var(--accent-purple)] text-white shadow-lg"
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

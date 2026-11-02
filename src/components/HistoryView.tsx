import React, { useState, useMemo } from 'react';
import { usePuff } from '../context/PuffContext';
import { Clock, Trash2, Plus, X, Zap, Flame } from 'lucide-react';
import type { MoodTag, ConsumptionType } from '../types';

export const HistoryView: React.FC = () => {
  const { puffs, deletePuff, addPuff, activeMode } = usePuff();
  const [filterMood, setFilterMood] = useState<MoodTag | 'All'>('All');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [missedMinutesAgo, setMissedMinutesAgo] = useState<number>(5);
  const [missedMood, setMissedMood] = useState<MoodTag>('Habit');
  const [missedType, setMissedType] = useState<ConsumptionType>(activeMode);

  const moodsList: MoodTag[] = ['Morning', 'Stress', 'Habit', 'Social', 'Post Meal', 'Boredom', 'Craving'];

  const filteredPuffs = useMemo(() => {
    return puffs.filter((p) => {
      if (filterMood !== 'All' && p.mood !== filterMood) return false;
      return true;
    });
  }, [puffs, filterMood]);

  const handleAddMissed = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = Date.now() - missedMinutesAgo * 60 * 1000;
    addPuff(missedMood, undefined, timestamp, missedType);
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
    <div className="flex flex-col w-full px-5 pb-12 pt-1 text-white">
      {/* Header */}
      <div className="w-full flex items-center justify-between pt-1 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Puff History
          </h1>
          <p className="text-xs text-zinc-400 font-medium">
            {puffs.length} total puffs logged
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-full bg-purple-600 hover:bg-purple-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Missed</span>
        </button>
      </div>

      {/* Mood Filters Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 scrollbar-none">
        <button
          onClick={() => setFilterMood('All')}
          className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            filterMood === 'All'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40'
              : 'bg-white/[0.05] text-zinc-400 hover:bg-white/10'
          }`}
        >
          All Puffs
        </button>
        {moodsList.map((m) => (
          <button
            key={m}
            onClick={() => setFilterMood(m)}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              filterMood === m
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40'
                : 'bg-white/[0.05] text-zinc-400 hover:bg-white/10'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Grouped Logs List */}
      <div className="flex flex-col gap-5">
        {Object.keys(groupedPuffs).length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#1c1c1e]/60 border border-white/5 backdrop-blur-xl">
            <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-400">No puffs logged yet</p>
            <p className="text-xs text-zinc-600 mt-1">Tap the large + button on the home screen to log a puff.</p>
          </div>
        ) : (
          Object.entries(groupedPuffs).map(([groupTitle, list]) => (
            <div key={groupTitle} className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">
                  {groupTitle}
                </span>
                <span className="text-xs text-purple-400 font-semibold">
                  {list.length} hits
                </span>
              </div>

              <div className="rounded-2xl bg-[#1c1c1e]/80 border border-white/[0.08] backdrop-blur-xl overflow-hidden divide-y divide-white/[0.05]">
                {list.slice(0, 50).map((puff) => {
                  const time = new Date(puff.timestamp).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                  });

                  const isCig = puff.type === 'cigarette';
                  return (
                    <div
                      key={puff.id}
                      className="flex items-center justify-between p-3.5 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isCig
                              ? 'bg-orange-600/20 text-orange-400'
                              : 'bg-purple-600/20 text-purple-400'
                          }`}
                        >
                          {isCig ? <Flame className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{time}</span>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                isCig
                                  ? 'bg-orange-500/20 text-orange-300'
                                  : 'bg-purple-500/20 text-purple-300'
                              }`}
                            >
                              {isCig ? 'Cigarette' : 'Vape'}
                            </span>
                          </div>
                          {puff.mood && (
                            <span className="inline-block px-2 py-0.5 mt-0.5 rounded-md bg-white/5 text-[10px] font-medium text-zinc-400">
                              {puff.mood}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => deletePuff(puff.id)}
                        className="w-8 h-8 rounded-full hover:bg-rose-500/20 flex items-center justify-center text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete puff"
                      >
                        <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <form
            onSubmit={handleAddMissed}
            className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-white/10 p-5 shadow-2xl flex flex-col gap-4 animate-scale-bounce"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Log Missed Hit</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMissedType('vape')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  missedType === 'vape'
                    ? 'bg-purple-600 text-white'
                    : 'bg-black/60 text-zinc-400 border border-white/5'
                }`}
              >
                ⚡ Vape
              </button>
              <button
                type="button"
                onClick={() => setMissedType('cigarette')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  missedType === 'cigarette'
                    ? 'bg-orange-600 text-white'
                    : 'bg-black/60 text-zinc-400 border border-white/5'
                }`}
              >
                🚬 Cigarette
              </button>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">How many minutes ago?</label>
              <input
                type="number"
                min="1"
                max="720"
                value={missedMinutesAgo}
                onChange={(e) => setMissedMinutesAgo(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Mood / Context</label>
              <select
                value={missedMood}
                onChange={(e) => setMissedMood(e.target.value as MoodTag)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-sm"
              >
                {moodsList.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-purple-600/30"
            >
              Add To History
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

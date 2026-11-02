import React from 'react';
import { soundManager } from '../utils/audio';
import { usePuff } from '../context/PuffContext';
import type { NavTabType } from '../types';
import { Flame, ClipboardCheck, Clock, BarChart2, Settings } from 'lucide-react';

export type TabType = NavTabType;

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isLight?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, isLight = false }) => {
  const { settings } = usePuff();

  const tabs: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'daily', label: 'Daily Puffs', icon: Flame },
    { id: 'plan', label: 'Plan', icon: ClipboardCheck },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'statistics', label: 'Statistics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (id: TabType) => {
    if (activeTab !== id) {
      soundManager.playClickSound(settings.soundEnabled);
      soundManager.triggerHaptic(settings.hapticsEnabled, 10);
      setActiveTab(id);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 w-full px-3 pt-2 pb-[max(12px,calc(env(safe-area-inset-bottom)+6px))] pointer-events-none">
      <div
        className={`mx-auto max-w-[440px] flex items-center justify-around rounded-[32px] p-2 transition-all duration-300 pointer-events-auto ${
          isLight
            ? 'bg-white/95 border border-black/[0.06] shadow-[0_15px_35px_rgba(0,0,0,0.08)] backdrop-blur-2xl'
            : 'bg-[#121214]/92 border border-white/[0.09] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] backdrop-blur-2xl'
        }`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center rounded-[20px] px-3 py-1.5 transition-all duration-200 cursor-pointer select-none ${
                isActive
                  ? isLight
                    ? 'text-[#4f46e5]'
                    : 'text-white'
                  : isLight
                  ? 'text-slate-400 hover:text-slate-600'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {/* Active Tab Background Capsule matching Screenshot 1 (Dark) & Screenshot 2 (Light) */}
              {isActive && (
                <div
                  className={`absolute inset-0 rounded-[20px] transition-all duration-300 ${
                    isLight
                      ? 'bg-indigo-600/12 border border-indigo-600/15 shadow-sm'
                      : 'bg-white/[0.14] border border-white/10 shadow-sm'
                  }`}
                />
              )}

              <Icon
                className={`relative z-10 w-5 h-5 transition-transform duration-200 ${
                  isActive
                    ? isLight
                      ? 'scale-110 text-[#4f46e5]'
                      : 'scale-110 text-purple-300'
                    : 'opacity-75'
                }`}
              />

              <span
                className={`relative z-10 mt-1 text-[10.5px] tracking-tight transition-opacity duration-200 ${
                  isActive
                    ? isLight
                      ? 'opacity-100 font-bold text-[#4f46e5]'
                      : 'opacity-100 font-bold text-white'
                    : 'opacity-70 font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

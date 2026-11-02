import React from 'react';
import { soundManager } from '../utils/audio';
import { usePuff } from '../context/PuffContext';
import type { NavTabType } from '../types';
import { Flame, ClipboardCheck, Clock, BarChart2, Settings } from 'lucide-react';

export type TabType = NavTabType;

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
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
        className="mx-auto max-w-[440px] flex items-center justify-around rounded-[32px] p-2 bg-[#121214]/92 border border-white/[0.09] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all duration-300 pointer-events-auto"
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
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {/* Active Tab Background Capsule matching Screenshot 1 (Dark) */}
              {isActive && (
                <div className="absolute inset-0 rounded-[20px] bg-white/[0.14] border border-white/10 shadow-sm transition-all duration-300" />
              )}

              <Icon
                className={`relative z-10 w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'scale-110 text-purple-300' : 'opacity-75'
                }`}
              />

              <span
                className={`relative z-10 mt-1 text-[10.5px] tracking-tight transition-opacity duration-200 ${
                  isActive ? 'opacity-100 font-bold text-white' : 'opacity-70 font-medium'
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

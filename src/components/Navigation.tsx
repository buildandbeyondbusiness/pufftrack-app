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
        className="mx-auto max-w-[440px] flex items-center justify-around rounded-[32px] p-2 shadow-2xl backdrop-blur-2xl transition-all duration-300 pointer-events-auto"
        style={{
          backgroundColor: 'rgba(18, 18, 20, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7)',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center rounded-2xl px-3 py-1.5 transition-all duration-200 cursor-pointer select-none ${
                isActive
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {isActive && (
                <div
                  className="absolute inset-0 rounded-2xl bg-white/[0.12] border border-white/10 shadow-sm transition-all duration-300"
                />
              )}

              <Icon
                className={`relative z-10 w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'scale-110 text-purple-300' : 'opacity-80'
                }`}
              />

              <span
                className={`relative z-10 mt-1 text-[10px] tracking-tight font-medium transition-opacity duration-200 ${
                  isActive ? 'opacity-100 font-bold text-white' : 'opacity-70'
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

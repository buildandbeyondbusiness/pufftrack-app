import React from 'react';
import { Flame, Clock, BarChart3, Smartphone } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { usePuff } from '../context/PuffContext';
import type { NavTabType } from '../types';

export type TabType = NavTabType;

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { settings } = usePuff();

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Flame },
    { id: 'models', label: 'Models', icon: Smartphone },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'History', icon: Clock },
  ];

  const handleTabClick = (id: TabType) => {
    if (activeTab !== id) {
      soundManager.playClickSound(settings.soundEnabled);
      soundManager.triggerHaptic(settings.hapticsEnabled, 10);
      setActiveTab(id);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 w-full px-4 pt-2 pb-[max(16px,calc(env(safe-area-inset-bottom)+8px))] pointer-events-none">
      <div
        className="mx-auto max-w-[440px] flex items-center justify-around rounded-full p-1.5 shadow-2xl backdrop-blur-2xl transition-all duration-300 pointer-events-auto"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)',
          borderWidth: '1px',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center rounded-full px-5 py-2 transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'scale-105 text-[var(--accent-purple)] font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {isActive && (
                <div
                  className="absolute inset-0 rounded-full opacity-100 transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--bg-accent-pill)',
                  }}
                />
              )}
              <Icon
                className={`relative z-10 h-5 w-5 transition-transform duration-300 ${
                  isActive ? 'scale-110 drop-shadow-[0_0_8px_var(--accent-purple-glow)]' : ''
                }`}
              />
              <span
                className={`relative z-10 mt-0.5 text-[10px] tracking-tight transition-opacity duration-300 ${
                  isActive ? 'opacity-100 font-semibold' : 'opacity-70'
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

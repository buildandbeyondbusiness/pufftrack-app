import React, { useState, useRef, useEffect } from 'react';
import { PuffProvider, usePuff } from './context/PuffContext';
import { Navigation } from './components/Navigation';
import type { TabType } from './components/Navigation';
import { DailyPuffsView } from './components/DailyPuffsView';
import { ProgressView } from './components/ProgressView';
import { PlanView } from './components/PlanView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { SyncSplashScreen } from './components/SyncSplashScreen';
import { DynamicIslandStatus } from './components/DynamicIslandStatus';
import { VaporCanvas } from './components/VaporCanvas';
import type { VaporCanvasRef } from './components/VaporCanvas';
import { MacOSNotification } from './components/MacOSNotification';
import type { ToastMessage } from './components/MacOSNotification';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [showSplashScreen, setShowSplashScreen] = useState<boolean>(true);
  const [macNotification, setMacNotification] = useState<ToastMessage | null>(null);
  const { settings, addPuff, todayCount, currentLimit } = usePuff();
  const vaporRef = useRef<VaporCanvasRef | null>(null);

  useEffect(() => {
    document.body.className = `theme-${settings.theme}`;
  }, [settings.theme]);

  // Handle URL Query Action Trigger (e.g. ?key=...&action=puff for iOS Back Tap)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'puff' || params.get('hit') === '1') {
      const now = Date.now();
      addPuff();

      if (vaporRef.current && settings.vaporEffectsEnabled) {
        vaporRef.current.emitPuff(undefined, undefined, 35);
      }
      setMacNotification({
        id: `backtap-${now}`,
        title: 'iPhone Back Tap Registered',
        subtitle: 'Puff logged & synced to SuperBase Cloud.',
        type: 'success',
      });

      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [addPuff, settings.vaporEffectsEnabled]);

  // Handle Spacebar Trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        )
      ) {
        e.preventDefault();
        addPuff();
        if (vaporRef.current && settings.vaporEffectsEnabled) {
          vaporRef.current.emitPuff(undefined, undefined, 30);
        }

        if (todayCount + 1 >= currentLimit) {
          setMacNotification({
            id: `warning-${Date.now()}`,
            title: 'Daily Limit Reached',
            subtitle: `You have reached your limit of ${currentLimit} puffs today.`,
            type: 'warning',
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addPuff, settings.vaporEffectsEnabled, todayCount, currentLimit]);

  const handleTriggerVapor = (e?: React.MouseEvent) => {
    if (todayCount + 1 >= currentLimit) {
      setMacNotification({
        id: `warning-${Date.now()}`,
        title: 'Daily Puff Limit Reached',
        subtitle: `You reached ${todayCount + 1}/${currentLimit} puffs for today.`,
        type: 'warning',
      });
    }

    if (vaporRef.current && settings.vaporEffectsEnabled) {
      if (e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top;
        vaporRef.current.emitPuff(x, y, 30);
      } else {
        vaporRef.current.emitPuff(undefined, undefined, 30);
      }
    }
  };

  return (
    <div className="app-viewport relative flex flex-col justify-between min-h-screen bg-black text-white font-sans overflow-hidden">
      {/* Smooth Database Sync Opening Page */}
      {showSplashScreen && (
        <SyncSplashScreen onComplete={() => setShowSplashScreen(false)} />
      )}

      {/* macOS Sequoia Dropdown Notification Banner */}
      <MacOSNotification
        notification={macNotification}
        onDismiss={() => setMacNotification(null)}
      />

      {/* Vapor Canvas Particles Overlay */}
      <VaporCanvas ref={vaporRef} enabled={settings.vaporEffectsEnabled} />

      {/* Dynamic Island Status Pill at Top */}
      <DynamicIslandStatus onOpenSettings={() => setActiveTab('settings')} />

      {/* Main View Area */}
      <main className="flex-1 w-full overflow-y-auto z-10 scrollbar-none pt-2 pb-28">
        {activeTab === 'daily' && (
          <DailyPuffsView
            onTriggerVapor={handleTriggerVapor}
            onOpenSettings={() => setActiveTab('settings')}
          />
        )}
        {activeTab === 'plan' && <PlanView />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'statistics' && <ProgressView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Floating Bottom 5-Tab Navigation Bar */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export function App() {
  return (
    <PuffProvider>
      <MainAppContent />
    </PuffProvider>
  );
}

export default App;

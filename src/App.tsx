import React, { useState, useRef, useEffect } from 'react';
import { PuffProvider, usePuff } from './context/PuffContext';
import { Navigation } from './components/Navigation';
import type { TabType } from './components/Navigation';
import { DailyPuffsView } from './components/DailyPuffsView';
import { HistoryView } from './components/HistoryView';
import { ProgressView } from './components/ProgressView';
import { ProfileView } from './components/ProfileView';
import { VaporCanvas } from './components/VaporCanvas';
import type { VaporCanvasRef } from './components/VaporCanvas';
import { DynamicIsland } from './components/DynamicIsland';
import { MacOSNotification } from './components/MacOSNotification';
import type { ToastMessage } from './components/MacOSNotification';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [lastHitPulseTime, setLastHitPulseTime] = useState<number>(0);
  const [macNotification, setMacNotification] = useState<ToastMessage | null>(null);
  const { settings, addPuff, todayCount, currentLimit } = usePuff();
  const vaporRef = useRef<VaporCanvasRef | null>(null);

  useEffect(() => {
    document.body.className = `theme-${settings.theme}`;
  }, [settings.theme]);

  // Handle URL Query Action Trigger (e.g. ?action=puff for iOS Back Tap)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'puff' || params.get('hit') === '1') {
      addPuff();
      setLastHitPulseTime(Date.now());
      if (vaporRef.current && settings.vaporEffectsEnabled) {
        vaporRef.current.emitPuff(undefined, undefined, 35);
      }
      setMacNotification({
        id: `backtap-${Date.now()}`,
        title: 'iPhone Back Tap Hit Registered',
        subtitle: `Puff #${todayCount + 1} logged via Back Tap gesture.`,
        type: 'success',
      });

      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [addPuff, settings.vaporEffectsEnabled, todayCount]);

  // Handle Spacebar Trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement)) {
        e.preventDefault();
        addPuff();
        setLastHitPulseTime(Date.now());
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
    setLastHitPulseTime(Date.now());
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
    <div className="app-viewport relative flex flex-col justify-between min-h-screen">
      {/* Centered Apple Dynamic Island Overlay */}
      <DynamicIsland lastHitPulseTime={lastHitPulseTime} />

      {/* macOS Sequoia Dropdown Notification Banner */}
      <MacOSNotification
        notification={macNotification}
        onDismiss={() => setMacNotification(null)}
      />

      {/* Vapor Canvas Particles Overlay */}
      <VaporCanvas ref={vaporRef} enabled={settings.vaporEffectsEnabled} />

      {/* Main View Area with generous 110px top spacing clearing Dynamic Island & 176px bottom spacing */}
      <main className="flex-1 w-full overflow-y-auto z-10 scrollbar-none pt-[calc(env(safe-area-inset-top,20px)+90px)] pb-44">
        {activeTab === 'home' && <DailyPuffsView onTriggerVapor={handleTriggerVapor} />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'progress' && <ProgressView />}
        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Navigation Bar */}
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

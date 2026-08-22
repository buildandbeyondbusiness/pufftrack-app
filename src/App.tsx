import React, { useState, useRef, useEffect } from 'react';
import { PuffProvider, usePuff } from './context/PuffContext';
import { Navigation } from './components/Navigation';
import type { TabType } from './components/Navigation';
import { DailyPuffsView } from './components/DailyPuffsView';
import { ModelsView } from './components/ModelsView';
import { ProgressView } from './components/ProgressView';
import { HistoryView } from './components/HistoryView';
import { ProfileModal } from './components/ProfileModal';
import { VaporCanvas } from './components/VaporCanvas';
import type { VaporCanvasRef } from './components/VaporCanvas';
import { MacOSNotification } from './components/MacOSNotification';
import type { ToastMessage } from './components/MacOSNotification';
import { syncSavePuff } from './firebase/service';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [macNotification, setMacNotification] = useState<ToastMessage | null>(null);
  const { settings, addPuff, todayCount, currentLimit, user } = usePuff();
  const vaporRef = useRef<VaporCanvasRef | null>(null);

  useEffect(() => {
    document.body.className = `theme-${settings.theme}`;
  }, [settings.theme]);

  // Handle URL Query Action Trigger (e.g. ?key=...&action=puff for iOS Back Tap)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'puff' || params.get('hit') === '1') {
      const targetUid = params.get('key') || params.get('uid') || user?.uid;
      const now = Date.now();
      const newPuff = {
        id: `puff-${now}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: now,
      };

      if (targetUid) {
        syncSavePuff(targetUid, newPuff);
      } else {
        addPuff();
      }

      if (vaporRef.current && settings.vaporEffectsEnabled) {
        vaporRef.current.emitPuff(undefined, undefined, 35);
      }
      setMacNotification({
        id: `backtap-${now}`,
        title: 'iPhone Back Tap Registered',
        subtitle: `Puff logged & synced to Cloud.`,
        type: 'success',
      });

      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [addPuff, settings.vaporEffectsEnabled, todayCount, user]);

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
    <div className="app-viewport relative flex flex-col justify-between min-h-screen">
      {/* macOS Sequoia Dropdown Notification Banner */}
      <MacOSNotification
        notification={macNotification}
        onDismiss={() => setMacNotification(null)}
      />

      {/* Vapor Canvas Particles Overlay */}
      <VaporCanvas ref={vaporRef} enabled={settings.vaporEffectsEnabled} />

      {/* Main View Area with native Apple safe-area padding */}
      <main className="flex-1 w-full overflow-y-auto z-10 scrollbar-none pt-[calc(env(safe-area-inset-top,20px)+12px)] pb-32">
        {activeTab === 'home' && (
          <DailyPuffsView
            onTriggerVapor={handleTriggerVapor}
            onOpenProfile={() => setShowProfileModal(true)}
          />
        )}
        {activeTab === 'models' && <ModelsView />}
        {activeTab === 'analytics' && <ProgressView />}
        {activeTab === 'history' && <HistoryView />}
      </main>

      {/* Profile & Settings Apple Sheet Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Bottom Navigation Bar */}
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

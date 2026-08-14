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
import { CheckCircle2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [lastHitPulseTime, setLastHitPulseTime] = useState<number>(0);
  const [backTapToast, setBackTapToast] = useState<string | null>(null);
  const { settings, addPuff } = usePuff();
  const vaporRef = useRef<VaporCanvasRef | null>(null);

  useEffect(() => {
    document.body.className = `theme-${settings.theme}`;
  }, [settings.theme]);

  // Handle URL Query Action Trigger (e.g. ?action=puff or ?hit=1 for iOS Back Tap / Shortcuts)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'puff' || params.get('hit') === '1') {
      addPuff();
      setLastHitPulseTime(Date.now());
      if (vaporRef.current && settings.vaporEffectsEnabled) {
        vaporRef.current.emitPuff(undefined, undefined, 35);
      }
      setBackTapToast('Puff logged via iPhone Back Tap / Shortcut! 📲');
      setTimeout(() => setBackTapToast(null), 3500);

      // Clean URL parameters without reloading
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [addPuff, settings.vaporEffectsEnabled]);

  // Handle Physical Hardware Keyboard / Side Button Shortcuts (e.g., Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger puff on Spacebar when not typing in input fields
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement)) {
        e.preventDefault();
        addPuff();
        setLastHitPulseTime(Date.now());
        if (vaporRef.current && settings.vaporEffectsEnabled) {
          vaporRef.current.emitPuff(undefined, undefined, 30);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addPuff, settings.vaporEffectsEnabled]);

  const handleTriggerVapor = (e?: React.MouseEvent) => {
    setLastHitPulseTime(Date.now());
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
      {/* Back Tap / Hardware Shortcut Toast Banner */}
      {backTapToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500 text-black font-bold text-xs shadow-2xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 stroke-[3]" />
          <span>{backTapToast}</span>
        </div>
      )}

      {/* Apple Dynamic Island Floating Overlay */}
      <DynamicIsland lastHitPulseTime={lastHitPulseTime} />

      {/* Vapor Canvas Particles Overlay */}
      <VaporCanvas ref={vaporRef} enabled={settings.vaporEffectsEnabled} />

      {/* Main View Area */}
      <main className="flex-1 w-full overflow-y-auto z-10 scrollbar-none pt-2">
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

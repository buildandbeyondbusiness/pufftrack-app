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

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { settings } = usePuff();
  const vaporRef = useRef<VaporCanvasRef | null>(null);

  useEffect(() => {
    document.body.className = `theme-${settings.theme}`;
  }, [settings.theme]);

  const handleTriggerVapor = (e?: React.MouseEvent) => {
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
      {/* Vapor Canvas Particles Overlay */}
      <VaporCanvas ref={vaporRef} enabled={settings.vaporEffectsEnabled} />

      {/* Main View Area */}
      <main className="flex-1 w-full overflow-y-auto z-10 scrollbar-none">
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

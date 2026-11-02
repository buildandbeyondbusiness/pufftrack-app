import React, { useState, useEffect } from 'react';
import { usePuff } from '../context/PuffContext';
import { Database, AlertCircle, RefreshCw } from 'lucide-react';

interface DynamicIslandStatusProps {
  onOpenSettings?: () => void;
}

export const DynamicIslandStatus: React.FC<DynamicIslandStatusProps> = ({ onOpenSettings }) => {
  const { syncState, syncStepMessage, retrySync, isSupabaseConnected } = usePuff();
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentNotification, setRecentNotification] = useState<string | null>(null);

  useEffect(() => {
    if (syncState === 'synced') {
      setRecentNotification('SuperBase Synced');
      const t = setTimeout(() => setRecentNotification(null), 3000);
      return () => clearTimeout(t);
    }
  }, [syncState]);

  return (
    <div className="w-full flex justify-center pt-2 px-4 z-40">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`group relative flex items-center justify-between gap-2.5 px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black/90 border border-white/10 shadow-2xl backdrop-blur-2xl transition-all duration-300 cursor-pointer ${
          isExpanded ? 'w-full max-w-[360px] py-2.5 rounded-2xl bg-zinc-950/95' : 'max-w-fit'
        }`}
      >
        {/* Left Status Indicator */}
        <div className="flex items-center gap-2">
          {syncState === 'syncing' ? (
            <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
          ) : syncState === 'synced' ? (
            <div className="relative flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="absolute w-3 h-3 rounded-full bg-emerald-400/50 animate-ping" />
            </div>
          ) : syncState === 'error' ? (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Database className="w-3.5 h-3.5 text-zinc-400" />
          )}

          <span className="text-[11px] font-semibold tracking-tight text-zinc-200">
            {recentNotification ||
              (syncState === 'syncing'
                ? 'Syncing SuperBase...'
                : syncState === 'synced'
                ? 'SuperBase Online'
                : syncState === 'error'
                ? 'Sync Warning'
                : 'Local Mode')}
          </span>
        </div>

        {/* Right Status Badge */}
        {!isExpanded && (
          <span className="text-[10px] text-zinc-500 font-mono pl-1">
            {isSupabaseConnected ? 'Cloud' : 'Local'}
          </span>
        )}

        {/* Expanded Drawer Content */}
        {isExpanded && (
          <div className="w-full flex flex-col gap-2 pt-2 border-t border-white/[0.08] mt-1.5 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Status:</span>
              <span className="font-medium text-white">{syncStepMessage}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Engine:</span>
              <span className="font-medium text-purple-400">
                {isSupabaseConnected ? 'SuperBase PostgreSQL + Realtime' : 'High-Speed Local Cache'}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  retrySync();
                }}
                className="flex-1 py-1.5 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-[11px] font-bold text-purple-200 transition-all cursor-pointer text-center"
              >
                Sync Now
              </button>
              {onOpenSettings && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                    onOpenSettings();
                  }}
                  className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white transition-all cursor-pointer"
                >
                  Configure
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

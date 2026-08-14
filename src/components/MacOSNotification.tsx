import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Zap, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  subtitle: string;
  type?: 'success' | 'warning' | 'info';
  timestamp?: string;
}

interface MacOSNotificationProps {
  notification: ToastMessage | null;
  onDismiss: () => void;
}

export const MacOSNotification: React.FC<MacOSNotificationProps> = ({ notification, onDismiss }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div className="fixed top-[max(60px,calc(env(safe-area-inset-top)+48px))] left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[380px] pointer-events-auto animate-in slide-in-from-top-8 fade-in duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.6)] text-white select-none relative overflow-hidden">
        {/* macOS Specular Top Highlight Line */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* macOS App Icon Avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-700 shadow-md text-white font-bold text-sm">
          {notification.type === 'warning' ? (
            <AlertTriangle className="h-5 w-5 text-amber-300" />
          ) : notification.type === 'info' ? (
            <Zap className="h-5 w-5 text-sky-300" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-300 stroke-[2.5]" />
          )}
        </div>

        {/* macOS Notification Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">PuffTrack</span>
            <span className="text-[10px] text-zinc-400 font-medium">{notification.timestamp || 'now'}</span>
          </div>

          <h4 className="text-xs font-bold text-white tracking-tight mt-0.5 truncate">{notification.title}</h4>
          <p className="text-[11px] text-zinc-300 font-medium leading-tight mt-0.5">{notification.subtitle}</p>
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import {
  subscribeUserPuffs,
  syncSavePuff,
  syncDeletePuff,
  subscribeUserProfile,
  syncSaveUserProfile
} from '../firebase/service';
import type {
  PuffLog,
  VapeProfile,
  AppSettings,
  MoodTag,
  DaySummary,
  Session,
  UserProfile
} from '../types';
import { soundManager } from '../utils/audio';

interface PuffContextType {
  puffs: PuffLog[];
  vapeProfile: VapeProfile;
  settings: AppSettings;
  user: UserProfile | null;
  isCloudSyncing: boolean;
  
  // Computed values
  todayPuffs: PuffLog[];
  todayCount: number;
  currentLimit: number;
  nicotinePerPuffMg: number;
  costPerPuff: number;
  todayNicotineMg: number;
  todayCost: number;
  timeSinceLastPuffSeconds: number;
  activeSession: Session | null;
  todaySessionsCount: number;
  todayVapingTimeSeconds: number;
  averageBreakMinutes: number;
  past7Days: DaySummary[];
  hourlyDistribution: number[]; // 24 items
  
  // Actions
  addPuff: (mood?: MoodTag, note?: string, customTimeMs?: number) => void;
  undoLastPuff: () => void;
  addMultiplePuffs: (count: number) => void;
  deletePuff: (id: string) => void;
  updatePuffMood: (id: string, mood: MoodTag) => void;
  updateVapeProfile: (updates: Partial<VapeProfile>) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  resetAllData: () => void;
  exportJSON: () => string;
  importJSON: (jsonStr: string) => boolean;
}

const DEFAULT_PROFILE: VapeProfile = {
  deviceType: 'Disposable',
  deviceName: 'ElfBar 5000',
  nicotineMgPerMl: 50,
  podCapacityMl: 13,
  totalPuffsPerPod: 5000,
  costPerPodOrBottle: 20,
  dailyLimitGoal: 60,
};

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  vaporEffectsEnabled: true,
  theme: 'apple-dark',
};

const generateInitialDemoPuffs = (): PuffLog[] => {
  const list: PuffLog[] = [];
  const now = Date.now();
  const oneDay = 86400 * 1000;
  
  for (let day = 6; day >= 0; day--) {
    const dayStart = new Date(now - day * oneDay);
    dayStart.setHours(8, 0, 0, 0);
    const dailyCount = Math.floor(Math.random() * 20) + 25;
    let currentTime = dayStart.getTime();

    for (let i = 0; i < dailyCount; i++) {
      const gap = (Math.random() * 30 + 10) * 60 * 1000;
      currentTime += gap;
      if (day === 0 && currentTime > now - 15 * 60 * 1000) break;
      
      const moods: MoodTag[] = ['Morning', 'Stress', 'Habit', 'Social', 'Post Meal', 'Boredom', 'Craving'];
      list.push({
        id: `demo-${day}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: currentTime,
        mood: moods[Math.floor(Math.random() * moods.length)],
      });
    }
  }
  return list.sort((a, b) => b.timestamp - a.timestamp);
};

const STORAGE_KEY_PUFFS = 'apple_puff_logs_v3';
const STORAGE_KEY_PROFILE = 'apple_vape_profile_v3';
const STORAGE_KEY_SETTINGS = 'apple_app_settings_v3';

const PuffContext = createContext<PuffContextType | null>(null);

export const PuffProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);

  const [puffs, setPuffs] = useState<PuffLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PUFFS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return generateInitialDemoPuffs();
  });

  const [vapeProfile, setVapeProfile] = useState<VapeProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PROFILE;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SETTINGS;
  });

  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());

  // Timer tick for live status
  useEffect(() => {
    const timer = setInterval(() => setNowTimestamp(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Firebase Google Auth Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });

        setIsCloudSyncing(true);

        // Subscribe to user's isolated Firestore puffs
        const unsubPuffs = subscribeUserPuffs(
          firebaseUser.uid,
          (cloudPuffs) => {
            if (cloudPuffs && cloudPuffs.length > 0) {
              setPuffs(cloudPuffs);
            }
            setIsCloudSyncing(false);
          },
          () => setIsCloudSyncing(false)
        );

        // Subscribe to user's isolated profile settings
        const unsubProfile = subscribeUserProfile(firebaseUser.uid, (data) => {
          if (data.vapeProfile) setVapeProfile(data.vapeProfile);
          if (data.settings) setSettings(data.settings);
        });

        return () => {
          unsubPuffs();
          unsubProfile();
        };
      } else {
        setUser(null);
        setIsCloudSyncing(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Local storage fallback sync
  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY_PUFFS, JSON.stringify(puffs));
    }
  }, [puffs, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(vapeProfile));
    }
  }, [vapeProfile, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    }
  }, [settings, user]);

  // Derived metrics
  const currentLimit = vapeProfile.dailyLimitGoal;

  const nicotinePerPuffMg = useMemo(() => {
    const totalNic = vapeProfile.nicotineMgPerMl * vapeProfile.podCapacityMl;
    return vapeProfile.totalPuffsPerPod > 0 ? totalNic / vapeProfile.totalPuffsPerPod : 0.1;
  }, [vapeProfile]);

  const costPerPuff = useMemo(() => {
    return vapeProfile.totalPuffsPerPod > 0 ? vapeProfile.costPerPodOrBottle / vapeProfile.totalPuffsPerPod : 0.004;
  }, [vapeProfile]);

  const todayPuffs = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startMs = startOfDay.getTime();
    return puffs.filter((p) => p.timestamp >= startMs);
  }, [puffs, nowTimestamp]);

  const todayCount = todayPuffs.length;
  const todayNicotineMg = Math.round(todayCount * nicotinePerPuffMg * 10) / 10;
  const todayCost = Math.round(todayCount * costPerPuff * 100) / 100;

  const timeSinceLastPuffSeconds = useMemo(() => {
    if (puffs.length === 0) return 0;
    const latestPuff = Math.max(...puffs.map((p) => p.timestamp));
    return Math.max(0, Math.floor((nowTimestamp - latestPuff) / 1000));
  }, [puffs, nowTimestamp]);

  // Session detection
  const { todaySessions, todaySessionsCount, todayVapingTimeSeconds } = useMemo(() => {
    if (todayPuffs.length === 0) {
      return { todaySessions: [], todaySessionsCount: 0, todayVapingTimeSeconds: 0 };
    }

    const sortedAsc = [...todayPuffs].sort((a, b) => a.timestamp - b.timestamp);
    const sessions: Session[] = [];
    let currentSession: Session | null = null;
    const SESSION_THRESHOLD_MS = 3 * 60 * 1000;

    sortedAsc.forEach((p) => {
      if (!currentSession) {
        currentSession = {
          id: `session-${p.timestamp}`,
          startTime: p.timestamp,
          endTime: p.timestamp,
          puffCount: 1,
        };
      } else if (p.timestamp - currentSession.endTime <= SESSION_THRESHOLD_MS) {
        currentSession.endTime = p.timestamp;
        currentSession.puffCount += 1;
      } else {
        sessions.push(currentSession);
        currentSession = {
          id: `session-${p.timestamp}`,
          startTime: p.timestamp,
          endTime: p.timestamp,
          puffCount: 1,
        };
      }
    });

    if (currentSession) sessions.push(currentSession);

    let totalDurationSeconds = 0;
    sessions.forEach((s) => {
      const duration = Math.max(15, Math.floor((s.endTime - s.startTime) / 1000));
      totalDurationSeconds += duration;
    });

    return {
      todaySessions: sessions,
      todaySessionsCount: sessions.length,
      todayVapingTimeSeconds: totalDurationSeconds,
    };
  }, [todayPuffs]);

  const activeSession = useMemo(() => {
    if (todaySessions.length === 0) return null;
    const last = todaySessions[todaySessions.length - 1];
    return nowTimestamp - last.endTime <= 3 * 60 * 1000 ? last : null;
  }, [todaySessions, nowTimestamp]);

  const averageBreakMinutes = useMemo(() => {
    if (todayPuffs.length < 2) return 0;
    const sorted = [...todayPuffs].sort((a, b) => a.timestamp - b.timestamp);
    let totalGapMs = 0;
    for (let i = 1; i < sorted.length; i++) {
      totalGapMs += sorted[i].timestamp - sorted[i - 1].timestamp;
    }
    return Math.round(totalGapMs / (sorted.length - 1) / 60000);
  }, [todayPuffs]);

  const hourlyDistribution = useMemo(() => {
    const hours = new Array(24).fill(0);
    todayPuffs.forEach((p) => {
      const h = new Date(p.timestamp).getHours();
      hours[h] += 1;
    });
    return hours;
  }, [todayPuffs]);

  const past7Days = useMemo(() => {
    const days: DaySummary[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const startMs = new Date(d.setHours(0, 0, 0, 0)).getTime();
      const endMs = new Date(d.setHours(23, 59, 59, 999)).getTime();

      const dayPuffs = puffs.filter((p) => p.timestamp >= startMs && p.timestamp <= endMs);
      const count = dayPuffs.length;

      days.push({
        dateStr,
        puffCount: count,
        limit: currentLimit,
        nicotineMg: Math.round(count * nicotinePerPuffMg * 10) / 10,
        estimatedCost: Math.round(count * costPerPuff * 100) / 100,
      });
    }

    return days;
  }, [puffs, currentLimit, nicotinePerPuffMg, costPerPuff]);

  // Actions
  const addPuff = (mood?: MoodTag, note?: string, customTimeMs?: number) => {
    const timestamp = customTimeMs || Date.now();
    const newPuff: PuffLog = {
      id: `puff-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp,
      mood,
      note,
    };

    if (todayCount + 1 > currentLimit && settings.soundEnabled) {
      soundManager.playWarningSound(true);
    } else {
      soundManager.playPuffSound(settings.soundEnabled);
    }

    soundManager.triggerHaptic(settings.hapticsEnabled, 25);

    setPuffs((prev) => [newPuff, ...prev]);

    if (user) {
      syncSavePuff(user.uid, newPuff);
    }
  };

  const undoLastPuff = () => {
    if (puffs.length === 0) return;
    const lastPuff = puffs[0];
    soundManager.playClickSound(settings.soundEnabled);
    soundManager.triggerHaptic(settings.hapticsEnabled, 15);

    setPuffs((prev) => prev.slice(1));

    if (user && lastPuff) {
      syncDeletePuff(user.uid, lastPuff.id);
    }
  };

  const addMultiplePuffs = (count: number) => {
    if (count <= 0) return;
    soundManager.playPuffSound(settings.soundEnabled);
    soundManager.triggerHaptic(settings.hapticsEnabled, [20, 40, 20]);
    const now = Date.now();
    const newLogs: PuffLog[] = [];
    for (let i = 0; i < count; i++) {
      const p: PuffLog = {
        id: `puff-multi-${now}-${i}`,
        timestamp: now - i * 2000,
      };
      newLogs.push(p);
      if (user) syncSavePuff(user.uid, p);
    }
    setPuffs((prev) => [...newLogs, ...prev]);
  };

  const deletePuff = (id: string) => {
    soundManager.playClickSound(settings.soundEnabled);
    setPuffs((prev) => prev.filter((p) => p.id !== id));
    if (user) {
      syncDeletePuff(user.uid, id);
    }
  };

  const updatePuffMood = (id: string, mood: MoodTag) => {
    setPuffs((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, mood };
          if (user) syncSavePuff(user.uid, updated);
          return updated;
        }
        return p;
      })
    );
  };

  const updateVapeProfile = (updates: Partial<VapeProfile>) => {
    const updated = { ...vapeProfile, ...updates };
    setVapeProfile(updated);
    if (user) {
      syncSaveUserProfile(user.uid, updated, settings);
    }
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    if (user) {
      syncSaveUserProfile(user.uid, vapeProfile, updated);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('Google Sign-In Error', e);
      alert('Sign-In failed. Please check your browser popup settings or Firebase credentials.');
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (e) {
      console.error('Sign Out error', e);
    }
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY_PUFFS);
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
    setPuffs([]);
    setVapeProfile(DEFAULT_PROFILE);
    setSettings(DEFAULT_SETTINGS);
  };

  const exportJSON = () => {
    return JSON.stringify({ puffs, vapeProfile, settings, exportDate: new Date().toISOString() }, null, 2);
  };

  const importJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.puffs)) setPuffs(parsed.puffs);
      if (parsed.vapeProfile) setVapeProfile(parsed.vapeProfile);
      if (parsed.settings) setSettings(parsed.settings);
      return true;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  };

  return (
    <PuffContext.Provider
      value={{
        puffs,
        vapeProfile,
        settings,
        user,
        isCloudSyncing,
        todayPuffs,
        todayCount,
        currentLimit,
        nicotinePerPuffMg,
        costPerPuff,
        todayNicotineMg,
        todayCost,
        timeSinceLastPuffSeconds,
        activeSession,
        todaySessionsCount,
        todayVapingTimeSeconds,
        averageBreakMinutes,
        past7Days,
        hourlyDistribution,
        addPuff,
        undoLastPuff,
        addMultiplePuffs,
        deletePuff,
        updatePuffMood,
        updateVapeProfile,
        updateSettings,
        signInWithGoogle,
        signOutUser,
        resetAllData,
        exportJSON,
        importJSON,
      }}
    >
      {children}
    </PuffContext.Provider>
  );
};

export const usePuff = () => {
  const ctx = useContext(PuffContext);
  if (!ctx) throw new Error('usePuff must be used within PuffProvider');
  return ctx;
};

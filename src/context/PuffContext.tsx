import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type {
  PuffLog,
  Session,
  VapeProfile,
  AppSettings,
  DaySummary,
  UserProfile,
  MoodTag,
  LungHealthInfo,
  PodRefillRecord,
} from '../types';
import { soundManager } from '../utils/audio';
import { auth, googleProvider } from '../firebase/config';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  syncSavePuff,
  syncDeletePuff,
  subscribeUserPuffs,
  syncSaveUserProfile,
} from '../firebase/service';
import { backendApi } from '../services/backendApi';

interface PuffContextType {
  // Data
  puffs: PuffLog[];
  vapeProfile: VapeProfile;
  settings: AppSettings;
  user: UserProfile | null;
  isCloudSyncing: boolean;
  syncKey: string;

  // Stats
  todayPuffs: PuffLog[];
  todayCount: number;
  currentLimit: number;
  nicotinePerPuffMg: number;
  todayNicotineMg: number;
  todayCost: number;
  timeSinceLastPuffSeconds: number;
  activeSession: Session | null;
  todaySessionsCount: number;
  todayVapingTimeSeconds: number;
  averageBreakMinutes: number;
  past7Days: DaySummary[];
  hourlyDistribution: number[]; // 24 items

  // Pod & Refill metrics (INR ₹)
  podPuffsUsed: number;
  podPuffsRemaining: number;
  podPercentRemaining: number;
  estimatedDaysUntilRefill: number;
  resetCurrentPod: () => void;
  refillHistory: PodRefillRecord[];
  recordPodRefill: (costInr?: number) => void;
  costPerPuff: number;
  podSpentCost: number;
  monthlyEstimatedCost: number;
  totalRefillSpend: number;

  // Lung Health Score & Insights
  lungHealth: LungHealthInfo;

  // Timed Session Mode
  isLiveSessionRunning: boolean;
  liveSessionSeconds: number;
  liveSessionPuffs: number;
  startLiveSession: () => void;
  stopLiveSession: () => void;
  
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
  costPerPodOrBottle: 1800, // ₹1,800 INR
  dailyLimitGoal: 60,
  currency: '₹',
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
  return list;
};

const STORAGE_KEY_PUFFS = 'apple_pufftrack_logs_v1';
const STORAGE_KEY_PROFILE = 'apple_pufftrack_profile_v1';
const STORAGE_KEY_SETTINGS = 'apple_pufftrack_settings_v1';
const STORAGE_KEY_POD_PUFFS = 'apple_pod_puffs_used_v1';
const STORAGE_KEY_REFILLS = 'apple_pod_refills_v1';

const PuffContext = createContext<PuffContextType | undefined>(undefined);

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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.costPerPodOrBottle === 20) parsed.costPerPodOrBottle = 1800;
        parsed.currency = '₹';
        return parsed;
      }
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

  const [podPuffsUsed, setPodPuffsUsed] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POD_PUFFS);
      if (saved) return Number(saved);
    } catch (e) {
      console.error(e);
    }
    return 1850; // Demo initial pod puffs
  });

  const [refillHistory, setRefillHistory] = useState<PodRefillRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REFILLS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'refill-demo-1',
        timestamp: Date.now() - 25 * 86400 * 1000,
        costInr: 1800,
        puffsLoggedOnPod: 4950,
        deviceName: 'ElfBar 5000',
        podCapacityMl: 13,
      },
      {
        id: 'refill-demo-2',
        timestamp: Date.now() - 52 * 86400 * 1000,
        costInr: 1800,
        puffsLoggedOnPod: 5020,
        deviceName: 'ElfBar 5000',
        podCapacityMl: 13,
      }
    ];
  });

  // Timed Session State
  const [isLiveSessionRunning, setIsLiveSessionRunning] = useState<boolean>(false);
  const [liveSessionSeconds, setLiveSessionSeconds] = useState<number>(0);
  const [liveSessionPuffs, setLiveSessionPuffs] = useState<number>(0);

  useEffect(() => {
    let interval: any = null;
    if (isLiveSessionRunning) {
      interval = setInterval(() => {
        setLiveSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveSessionRunning]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_POD_PUFFS, podPuffsUsed.toString());
  }, [podPuffsUsed]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REFILLS, JSON.stringify(refillHistory));
  }, [refillHistory]);

  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());

  // Timer tick for live status
  useEffect(() => {
    const timer = setInterval(() => setNowTimestamp(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Sync key for device shortcuts
  const syncKey = useMemo(() => {
    if (user?.uid) return user.uid;
    try {
      const local = localStorage.getItem('pufftrack_device_key');
      if (local) return local;
      const gen = 'PT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      localStorage.setItem('pufftrack_device_key', gen);
      return gen;
    } catch {
      return 'PT-LOCAL';
    }
  }, [user]);

  // Connect to Cloudflare Edge API
  useEffect(() => {
    backendApi.startKeepAlivePing();

    backendApi.connectStream(syncKey, (data: any) => {
      if (data.puff) {
        soundManager.playPuffSound(settings.soundEnabled);
        soundManager.triggerHaptic(settings.hapticsEnabled, 25);
        setPuffs((prev) => {
          if (prev.some((p) => p.id === data.puff.id || Math.abs(p.timestamp - data.puff.timestamp) < 1000)) {
            return prev;
          }
          return [data.puff, ...prev];
        });
        setPodPuffsUsed((prev) => prev + 1);
      }
    });

    return () => {
      backendApi.disconnectStream();
    };
  }, [syncKey, settings.soundEnabled, settings.hapticsEnabled]);

  // Auth Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const uProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        setUser(uProfile);
        setIsCloudSyncing(true);

        subscribeUserPuffs(firebaseUser.uid, (cloudPuffs: PuffLog[]) => {
          setPuffs((localPuffs) => {
            const combined = [...cloudPuffs];
            localPuffs.forEach((lp) => {
              if (!combined.some((cp) => cp.id === lp.id)) {
                combined.push(lp);
                syncSavePuff(firebaseUser.uid, lp);
              }
            });
            combined.sort((a, b) => b.timestamp - a.timestamp);
            return combined;
          });
          setIsCloudSyncing(false);
        });
      } else {
        setUser(null);
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

  // Cost per puff in INR (₹)
  const costPerPuff = useMemo(() => {
    return vapeProfile.totalPuffsPerPod > 0 ? vapeProfile.costPerPodOrBottle / vapeProfile.totalPuffsPerPod : 0.36;
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

  // Pod & Refill Cost Metrics in INR (₹)
  const podPuffsRemaining = Math.max(0, vapeProfile.totalPuffsPerPod - podPuffsUsed);
  const podPercentRemaining = Math.max(
    0,
    Math.min(100, Math.round((podPuffsRemaining / Math.max(1, vapeProfile.totalPuffsPerPod)) * 100))
  );

  const estimatedDaysUntilRefill = useMemo(() => {
    const dailyPace = todayCount > 0 ? Math.max(15, todayCount) : (vapeProfile.dailyLimitGoal || 50);
    return Math.max(0, Math.round(podPuffsRemaining / dailyPace));
  }, [podPuffsRemaining, todayCount, vapeProfile.dailyLimitGoal]);

  const podSpentCost = Math.round(podPuffsUsed * costPerPuff * 10) / 10;
  const monthlyEstimatedCost = Math.round((todayCount > 0 ? todayCount : (vapeProfile.dailyLimitGoal || 50)) * 30 * costPerPuff);
  const totalRefillSpend = Math.round(
    refillHistory.reduce((sum, r) => sum + (r.costInr || 0), 0) + podSpentCost
  );

  // Session detection
  const { todaySessions, todaySessionsCount, todayVapingTimeSeconds } = useMemo(() => {
    if (todayPuffs.length === 0) return { todaySessions: [], todaySessionsCount: 0, todayVapingTimeSeconds: 0 };

    const sortedToday = [...todayPuffs].sort((a, b) => a.timestamp - b.timestamp);
    const sessions: Session[] = [];
    let currentSession: PuffLog[] = [];
    const SESSION_GAP_MS = 5 * 60 * 1000;

    sortedToday.forEach((puff) => {
      if (currentSession.length === 0) {
        currentSession.push(puff);
      } else {
        const lastPuff = currentSession[currentSession.length - 1];
        if (puff.timestamp - lastPuff.timestamp <= SESSION_GAP_MS) {
          currentSession.push(puff);
        } else {
          sessions.push({
            id: `session-${currentSession[0].timestamp}`,
            startTime: currentSession[0].timestamp,
            endTime: lastPuff.timestamp,
            puffCount: currentSession.length,
          });
          currentSession = [puff];
        }
      }
    });

    if (currentSession.length > 0) {
      const lastPuff = currentSession[currentSession.length - 1];
      sessions.push({
        id: `session-${currentSession[0].timestamp}`,
        startTime: currentSession[0].timestamp,
        endTime: lastPuff.timestamp,
        puffCount: currentSession.length,
      });
    }

    let totalDurationSeconds = 0;
    sessions.forEach((s) => {
      const duration = Math.max(30, Math.floor((s.endTime - s.startTime) / 1000) + s.puffCount * 4);
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
    const latest = todaySessions[todaySessions.length - 1];
    if (nowTimestamp - latest.endTime < 5 * 60 * 1000) {
      return latest;
    }
    return null;
  }, [todaySessions, nowTimestamp]);

  const averageBreakMinutes = useMemo(() => {
    if (todayPuffs.length < 2) return 0;
    const sorted = [...todayPuffs].sort((a, b) => a.timestamp - b.timestamp);
    let totalGapsMs = 0;
    for (let i = 1; i < sorted.length; i++) {
      totalGapsMs += sorted[i].timestamp - sorted[i - 1].timestamp;
    }
    const avgMs = totalGapsMs / (sorted.length - 1);
    return Math.round(avgMs / 60000);
  }, [todayPuffs]);

  // Past 7 days summary
  const past7Days: DaySummary[] = useMemo(() => {
    const list: DaySummary[] = [];
    const oneDay = 86400 * 1000;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const dayStartMs = todayStart.getTime() - i * oneDay;
      const dayEndMs = dayStartMs + oneDay;
      const dayDate = new Date(dayStartMs);
      const dateStr = dayDate.toISOString().split('T')[0];

      const dayPuffs = puffs.filter((p) => p.timestamp >= dayStartMs && p.timestamp < dayEndMs);
      const count = dayPuffs.length;
      const dayNicotine = Math.round(count * nicotinePerPuffMg * 10) / 10;
      const dayCost = Math.round(count * costPerPuff * 100) / 100;

      list.push({
        dateStr,
        puffCount: count,
        limit: currentLimit,
        nicotineMg: dayNicotine,
        estimatedCost: dayCost,
      });
    }

    return list;
  }, [puffs, currentLimit, nicotinePerPuffMg, costPerPuff]);

  // Hourly 24h distribution
  const hourlyDistribution = useMemo(() => {
    const hours = new Array(24).fill(0);
    todayPuffs.forEach((p) => {
      const h = new Date(p.timestamp).getHours();
      hours[h] += 1;
    });
    return hours;
  }, [todayPuffs]);

  // Lung Health calculation strictly mapped to user Daily Puffs categories:
  // 0: None, 1–25: Lower, 26–75: Moderate, 76–199: High, 200+: Very High
  const lungHealth: LungHealthInfo = useMemo(() => {
    const cleanMins = Math.floor(timeSinceLastPuffSeconds / 60);

    if (todayCount === 0) {
      return {
        status: 'None',
        score: 100,
        recoveryPace: '0 hits • Airway completely clear',
        advice: 'Zero hits logged today. Your respiratory tract is fully resting.',
        cleanTimeMinutes: cleanMins,
      };
    }

    if (todayCount <= 25) {
      return {
        status: 'Lower',
        score: 85,
        recoveryPace: '1–25 hits • Minimal aerosol load',
        advice: 'Lower tier usage. Cilia remain active with quick recovery between hits.',
        cleanTimeMinutes: cleanMins,
      };
    }

    if (todayCount <= 75) {
      return {
        status: 'Moderate',
        score: 65,
        recoveryPace: '26–75 hits • Moderate volume',
        advice: 'Moderate exposure. Stay hydrated and keep spacing between pulls.',
        cleanTimeMinutes: cleanMins,
      };
    }

    if (todayCount <= 199) {
      return {
        status: 'High',
        score: 40,
        recoveryPace: '76–199 hits • Elevated airway load',
        advice: 'High puff volume today. Take longer breaks to allow lung tissue to rest.',
        cleanTimeMinutes: cleanMins,
      };
    }

    return {
      status: 'Very High',
      score: 15,
      recoveryPace: '200+ hits • Heavy respiratory load',
      advice: 'Very high volume today. Step away from your vape for the evening.',
      cleanTimeMinutes: cleanMins,
    };
  }, [todayCount, timeSinceLastPuffSeconds]);

  const resetCurrentPod = () => {
    setPodPuffsUsed(0);
    soundManager.playClickSound(settings.soundEnabled);
    soundManager.triggerHaptic(settings.hapticsEnabled, 25);
  };

  const recordPodRefill = (costInr?: number) => {
    const refillCost = costInr !== undefined && costInr > 0 ? costInr : vapeProfile.costPerPodOrBottle;
    const newRecord: PodRefillRecord = {
      id: `refill-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      costInr: refillCost,
      puffsLoggedOnPod: podPuffsUsed,
      deviceName: vapeProfile.deviceName,
      podCapacityMl: vapeProfile.podCapacityMl,
    };
    setRefillHistory((prev) => [newRecord, ...prev]);
    setPodPuffsUsed(0);
    soundManager.playClickSound(settings.soundEnabled);
    soundManager.triggerHaptic(settings.hapticsEnabled, 30);
  };

  const startLiveSession = () => {
    setIsLiveSessionRunning(true);
    setLiveSessionSeconds(0);
    setLiveSessionPuffs(0);
    soundManager.playClickSound(settings.soundEnabled);
    soundManager.triggerHaptic(settings.hapticsEnabled, 15);
  };

  const stopLiveSession = () => {
    setIsLiveSessionRunning(false);
    soundManager.playClickSound(settings.soundEnabled);
    soundManager.triggerHaptic(settings.hapticsEnabled, 20);
  };

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
    setPodPuffsUsed((prev) => prev + 1);
    if (isLiveSessionRunning) {
      setLiveSessionPuffs((prev) => prev + 1);
    }

    if (user) {
      syncSavePuff(user.uid, newPuff);
    }
  };

  const undoLastPuff = () => {
    if (puffs.length === 0) return;
    const lastPuff = puffs[0];
    setPuffs((prev) => prev.slice(1));
    setPodPuffsUsed((prev) => Math.max(0, prev - 1));
    soundManager.playClickSound(settings.soundEnabled);
    soundManager.triggerHaptic(settings.hapticsEnabled, 15);

    if (user && lastPuff) {
      syncDeletePuff(user.uid, lastPuff.id);
    }
  };

  const addMultiplePuffs = (count: number) => {
    const now = Date.now();
    const newBatch: PuffLog[] = [];
    for (let i = 0; i < count; i++) {
      newBatch.push({
        id: `batch-${now}-${i}`,
        timestamp: now - (count - 1 - i) * 1000,
        mood: 'Habit',
      });
    }

    setPuffs((prev) => [...newBatch, ...prev]);
    setPodPuffsUsed((prev) => prev + count);
    soundManager.playPuffSound(settings.soundEnabled);
    soundManager.triggerHaptic(settings.hapticsEnabled, 35);

    if (user) {
      newBatch.forEach((p) => syncSavePuff(user.uid, p));
    }
  };

  const deletePuff = (id: string) => {
    setPuffs((prev) => prev.filter((p) => p.id !== id));
    soundManager.playClickSound(settings.soundEnabled);
    soundManager.triggerHaptic(settings.hapticsEnabled, 15);

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
    setVapeProfile((prev) => {
      const next = { ...prev, ...updates, currency: '₹' };
      if (user) syncSaveUserProfile(user.uid, next, settings);
      return next;
    });
    soundManager.playClickSound(settings.soundEnabled);
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      if (user) syncSaveUserProfile(user.uid, vapeProfile, next);
      return next;
    });
    soundManager.playClickSound(settings.soundEnabled);
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('Google Sign In Error', e);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (e) {
      console.error('Sign Out Error', e);
    }
  };

  const resetAllData = () => {
    setPuffs([]);
    setPodPuffsUsed(0);
    setRefillHistory([]);
    setVapeProfile(DEFAULT_PROFILE);
    localStorage.removeItem(STORAGE_KEY_PUFFS);
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    localStorage.removeItem(STORAGE_KEY_POD_PUFFS);
    localStorage.removeItem(STORAGE_KEY_REFILLS);
    soundManager.playClickSound(settings.soundEnabled);
  };

  const exportJSON = () => {
    return JSON.stringify(
      {
        puffs,
        vapeProfile,
        settings,
        podPuffsUsed,
        refillHistory,
        exportDate: new Date().toISOString()
      },
      null,
      2
    );
  };

  const importJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.puffs)) setPuffs(parsed.puffs);
      if (parsed.vapeProfile) setVapeProfile(parsed.vapeProfile);
      if (parsed.settings) setSettings(parsed.settings);
      if (typeof parsed.podPuffsUsed === 'number') setPodPuffsUsed(parsed.podPuffsUsed);
      if (Array.isArray(parsed.refillHistory)) setRefillHistory(parsed.refillHistory);
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
        syncKey,
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
        podPuffsUsed,
        podPuffsRemaining,
        podPercentRemaining,
        estimatedDaysUntilRefill,
        resetCurrentPod,
        refillHistory,
        recordPodRefill,
        podSpentCost,
        monthlyEstimatedCost,
        totalRefillSpend,
        lungHealth,
        isLiveSessionRunning,
        liveSessionSeconds,
        liveSessionPuffs,
        startLiveSession,
        stopLiveSession,
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

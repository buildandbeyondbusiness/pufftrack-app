export type MoodTag = 'Stress' | 'Boredom' | 'Social' | 'Morning' | 'Post Meal' | 'Habit' | 'Craving';

export type ConsumptionType = 'vape' | 'cigarette';

export interface PuffLog {
  id: string;
  timestamp: number; // unix ms
  mood?: MoodTag;
  note?: string;
  type?: ConsumptionType;
}

export interface Session {
  id: string;
  startTime: number;
  endTime: number;
  puffCount: number;
}

export type VapeDeviceType = 'Disposable' | 'Pod System' | 'Sub-Ohm Mod' | 'Nic Salt Tank';

export interface VapeProfile {
  deviceType: VapeDeviceType;
  deviceName: string;
  nicotineMgPerMl: number; // e.g. 50mg/ml for 5% salt nic
  podCapacityMl: number; // e.g. 2ml, 10ml, 13ml
  totalPuffsPerPod: number; // e.g. 5000 puffs
  costPerPodOrBottle: number; // In INR (₹), e.g. ₹1800
  dailyLimitGoal: number; // e.g. 60 puffs/day
  currency?: string; // '₹'

  // Cigarette Profile
  cigCostPerPack?: number; // e.g. ₹360 per pack
  cigsPerPack?: number; // e.g. 20 sticks
  cigDailyLimit?: number; // e.g. 10 sticks/day
  cigNicotinePerStick?: number; // e.g. 1.2 mg/stick
}

export interface PodRefillRecord {
  id: string;
  timestamp: number;
  costInr: number;
  puffsLoggedOnPod: number;
  deviceName: string;
  podCapacityMl: number;
}

export type AppTheme =
  | 'apple-dark'
  | 'apple-light'
  | 'midnight-blue'
  | 'emerald-ios'
  | 'cyberpunk-violet'
  | 'tokyo-neon'
  | 'sunset-coral'
  | 'titanium-gold'
  | 'crimson-stealth'
  | 'glacier-arctic';

export interface AppSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  vaporEffectsEnabled: boolean;
  theme: AppTheme;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type NavTabType = 'daily' | 'plan' | 'history' | 'statistics' | 'settings';

export type LungHealthStatus = 'None' | 'Lower' | 'Moderate' | 'High' | 'Very High';

export interface LungHealthInfo {
  status: LungHealthStatus;
  score: number; // 0 - 100
  recoveryPace: string;
  advice: string;
  cleanTimeMinutes: number;
}

export interface DaySummary {
  dateStr: string; // YYYY-MM-DD
  puffCount: number;
  limit: number;
  nicotineMg: number;
  estimatedCost: number;
}

export type SyncState = 'syncing' | 'synced' | 'local' | 'error';

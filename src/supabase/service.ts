import { getSupabase } from './config';
import type { PuffLog, VapeProfile, AppSettings, PodRefillRecord } from '../types';

/**
 * Fetch all puffs for a user from Supabase
 */
export const fetchUserPuffs = async (userId: string): Promise<PuffLog[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('puffs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(2000);

    if (error) {
      console.warn('[Supabase] Fetch puffs error:', error.message);
      return [];
    }

    return (data || []).map((row: any) => {
      const isCig =
        row.type === 'cigarette' ||
        row.note?.includes('[cigarette]') ||
        row.note === 'Cigarette';

      let cleanNote = row.note || undefined;
      if (cleanNote?.startsWith('[cigarette]')) {
        cleanNote = cleanNote.replace('[cigarette]', '').trim() || undefined;
      }

      return {
        id: row.id,
        timestamp: Number(row.timestamp),
        mood: row.mood || undefined,
        note: cleanNote,
        type: isCig ? 'cigarette' : 'vape',
      };
    });
  } catch (err) {
    console.warn('[Supabase] Exception fetching puffs:', err);
    return [];
  }
};

/**
 * Sync a single puff hit to Supabase
 */
export const syncSavePuff = async (userId: string, puff: PuffLog): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const noteVal =
      puff.type === 'cigarette'
        ? puff.note
          ? `[cigarette] ${puff.note}`
          : '[cigarette]'
        : puff.note || null;

    const { error } = await supabase.from('puffs').upsert(
      {
        id: puff.id,
        user_id: userId,
        timestamp: puff.timestamp,
        mood: puff.mood || null,
        note: noteVal,
        created_at: new Date(puff.timestamp).toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.warn('[Supabase] Save puff error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Save puff exception:', err);
    return false;
  }
};

/**
 * Delete a puff hit from Supabase
 */
export const syncDeletePuff = async (userId: string, puffId: string): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('puffs')
      .delete()
      .eq('id', puffId)
      .eq('user_id', userId);

    if (error) {
      console.warn('[Supabase] Delete puff error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Delete puff exception:', err);
    return false;
  }
};

/**
 * Fetch user profile & settings from Supabase
 */
export const fetchUserProfile = async (
  userId: string
): Promise<{ vapeProfile?: VapeProfile; settings?: AppSettings } | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('vape_profile, app_settings')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.warn('[Supabase] Fetch profile error:', error.message);
      }
      return null;
    }

    return {
      vapeProfile: data?.vape_profile as VapeProfile | undefined,
      settings: data?.app_settings as AppSettings | undefined,
    };
  } catch (err) {
    console.warn('[Supabase] Fetch profile exception:', err);
    return null;
  }
};

/**
 * Save user profile & settings to Supabase
 */
export const syncSaveUserProfile = async (
  userId: string,
  vapeProfile: VapeProfile,
  settings: AppSettings
): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('user_profiles').upsert(
      {
        user_id: userId,
        vape_profile: vapeProfile,
        app_settings: settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (error) {
      console.warn('[Supabase] Save profile error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Save profile exception:', err);
    return false;
  }
};

/**
 * Fetch pod refills from Supabase
 */
export const fetchPodRefills = async (userId: string): Promise<PodRefillRecord[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('pod_refills')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.warn('[Supabase] Fetch pod refills error:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      timestamp: Number(row.timestamp),
      costInr: Number(row.cost_inr || 0),
      puffsLoggedOnPod: Number(row.puffs_logged || 0),
      deviceName: row.device_name || '',
      podCapacityMl: Number(row.pod_capacity_ml || 0),
    }));
  } catch (err) {
    console.warn('[Supabase] Fetch pod refills exception:', err);
    return [];
  }
};

/**
 * Save pod refill to Supabase
 */
export const syncSavePodRefill = async (
  userId: string,
  refill: PodRefillRecord
): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('pod_refills').upsert(
      {
        id: refill.id,
        user_id: userId,
        timestamp: refill.timestamp,
        cost_inr: refill.costInr,
        puffs_logged: refill.puffsLoggedOnPod,
        device_name: refill.deviceName,
        pod_capacity_ml: refill.podCapacityMl,
        created_at: new Date(refill.timestamp).toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.warn('[Supabase] Save refill error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Save refill exception:', err);
    return false;
  }
};

/**
 * Subscribe to realtime puff updates via Supabase Channel
 */
export const subscribeUserPuffs = (
  userId: string,
  onDataChanged: () => void
): (() => void) => {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  try {
    const channel = supabase
      .channel(`puffs-realtime-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'puffs',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          onDataChanged();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Supabase] Realtime subscription exception:', err);
    return () => {};
  }
};

/**
 * Test connectivity with Supabase credentials
 */
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      success: false,
      message: 'No Supabase credentials configured.',
    };
  }

  try {
    // Attempt a light select to test permissions and connectivity
    const { error } = await supabase.from('puffs').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! (Note: Table `puffs` needs to be created from schema script).',
        };
      }
      return {
        success: false,
        message: `Supabase error: ${error.message} (${error.code})`,
      };
    }
    return {
      success: true,
      message: 'Connected & database tables verified successfully!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Connection failed.',
    };
  }
};

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://rhefptyiixgsmryayidb.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_dTjkWJcUftyYf9BaC59z3A_ozYlT0GY';

const cleanSupabaseUrl = (raw: string): string => {
  let u = raw.trim();
  u = u.replace(/\/rest\/v1\/?$/, '');
  u = u.replace(/\/+$/, '');
  return u;
};

// Environment variables or localStorage override with default fallback
const getStoredUrl = (): string => {
  if (typeof window === 'undefined') return DEFAULT_SUPABASE_URL;
  const raw =
    localStorage.getItem('pufftrack_supabase_url') ||
    import.meta.env.VITE_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;
  return cleanSupabaseUrl(raw);
};

const getStoredKey = (): string => {
  if (typeof window === 'undefined') return DEFAULT_SUPABASE_KEY;
  return (
    localStorage.getItem('pufftrack_supabase_anon_key') ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_KEY
  ).trim();
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  const url = getStoredUrl();
  const key = getStoredKey();

  if (!url || !key) {
    return null;
  }

  if (
    !supabaseInstance ||
    (supabaseInstance as any).supabaseUrl !== url
  ) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
};

export const isSupabaseConfigured = (): boolean => {
  const url = getStoredUrl();
  const key = getStoredKey();
  return Boolean(url && key && url.startsWith('http'));
};

export const saveSupabaseCredentials = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    const cleaned = cleanSupabaseUrl(url);
    if (cleaned) {
      localStorage.setItem('pufftrack_supabase_url', cleaned);
    } else {
      localStorage.removeItem('pufftrack_supabase_url');
    }
    if (key.trim()) {
      localStorage.setItem('pufftrack_supabase_anon_key', key.trim());
    } else {
      localStorage.removeItem('pufftrack_supabase_anon_key');
    }
    supabaseInstance = null; // force re-instantiation
  }
};

export const getSupabaseCredentials = () => {
  return {
    url: getStoredUrl(),
    key: getStoredKey(),
  };
};

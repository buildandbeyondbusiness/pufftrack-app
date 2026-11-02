interface Env {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
};

const saveToSupabase = async (
  key: string,
  timestamp: number,
  mood: string | null,
  note: string | null,
  env?: Env
) => {
  const rawUrl = env?.SUPABASE_URL || 'https://rhefptyiixgsmryayidb.supabase.co';
  const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  const apiKey = env?.SUPABASE_ANON_KEY || 'sb_publishable_dTjkWJcUftyYf9BaC59z3A_ozYlT0GY';

  const endpoint = `${cleanUrl}/rest/v1/puffs`;
  const puffId = `hit-${timestamp}-${Math.random().toString(36).substring(2, 7)}`;

  const body = {
    id: puffId,
    user_id: key,
    timestamp,
    mood: mood || 'Habit',
    note: note || null,
    created_at: new Date(timestamp).toISOString(),
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('[Action Button Supabase Error]', errText);
    }
  } catch (err: any) {
    console.error('[Action Button Supabase Exception]', err?.message);
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, waitUntil, env } = context;
  const url = new URL(request.url);

  let key = url.searchParams.get('key') || 'default-device';
  let mood = url.searchParams.get('mood') || null;
  let type = url.searchParams.get('type') || 'vape';

  if (request.method === 'POST') {
    try {
      const json: any = await request.json();
      if (json.key) key = json.key;
      if (json.mood) mood = json.mood;
      if (json.type) type = json.type;
    } catch {
      // fallback to query params
    }
  }

  const now = Date.now();
  const puffId = `action-${now}-${Math.random().toString(36).substring(2, 6)}`;
  const newPuff = {
    id: puffId,
    timestamp: now,
    mood: mood || (type === 'cigarette' ? 'Cigarette' : 'Habit'),
    type: type as any,
  };

  const noteVal = type === 'cigarette' ? '[cigarette]' : null;

  // Asynchronous edge write via waitUntil (instant 0ms response to iPhone Action button)
  if (waitUntil) {
    waitUntil(saveToSupabase(key, now, mood, noteVal, env));
  } else {
    await saveToSupabase(key, now, mood, noteVal, env);
  }

  return new Response(
    JSON.stringify({
      success: true,
      provider: 'superbase-edge',
      action: 'puff_logged',
      puff: newPuff,
      timestamp: now,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
};

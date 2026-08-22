interface Env {}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const saveToFirebaseFirestore = async (key: string, timestamp: number, mood?: string | null) => {
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/draw-2b7a5/databases/(default)/documents/users/${encodeURIComponent(key)}/puffs`;
  const body = {
    fields: {
      timestamp: { integerValue: String(timestamp) },
      createdAt: { stringValue: new Date(timestamp).toISOString() },
      mood: mood ? { stringValue: mood } : { nullValue: null },
    },
  };

  try {
    await fetch(firestoreUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err: any) {
    console.error('[Cloudflare Firestore Write Error]', err?.message);
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, waitUntil } = context;
  const url = new URL(request.url);

  let key = url.searchParams.get('key') || 'default-device';
  let mood = url.searchParams.get('mood') || null;

  if (request.method === 'POST') {
    try {
      const json: any = await request.json();
      if (json.key) key = json.key;
      if (json.mood) mood = json.mood;
    } catch (e) {
      // fallback to query params
    }
  }

  const now = Date.now();
  const newPuff = {
    id: `cf-${now}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    mood: mood || undefined,
  };

  // Asynchronous edge write via waitUntil (0ms blocking for iOS shortcuts)
  if (waitUntil) {
    waitUntil(saveToFirebaseFirestore(key, now, mood));
  } else {
    saveToFirebaseFirestore(key, now, mood);
  }

  return new Response(
    JSON.stringify({
      success: true,
      provider: 'cloudflare-edge',
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

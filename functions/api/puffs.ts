interface Env {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const key = url.searchParams.get('key') || 'default-device';

  const rawUrl = context.env?.SUPABASE_URL || 'https://rhefptyiixgsmryayidb.supabase.co';
  const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  const apiKey = context.env?.SUPABASE_ANON_KEY || 'sb_publishable_dTjkWJcUftyYf9BaC59z3A_ozYlT0GY';

  const restUrl = `${cleanUrl}/rest/v1/puffs?user_id=eq.${encodeURIComponent(key)}&order=timestamp.desc&limit=100`;

  try {
    const res = await fetch(restUrl, {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const puffs: any = await res.json();

    return new Response(
      JSON.stringify({
        key,
        puffs: Array.isArray(puffs) ? puffs : [],
        count: Array.isArray(puffs) ? puffs.length : 0,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        key,
        puffs: [],
        error: err?.message,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

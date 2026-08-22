interface Env {}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestGet: PagesFunction<Env> = async () => {
  return new Response(
    JSON.stringify({
      app: 'PuffTrack Cloudflare Edge API',
      status: 'online',
      provider: 'Cloudflare Pages / Workers Edge',
      region: 'global',
      pingedAt: Date.now(),
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

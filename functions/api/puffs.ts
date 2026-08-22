interface Env {}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const key = url.searchParams.get('key') || 'default-device';

  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/draw-2b7a5/databases/(default)/documents/users/${encodeURIComponent(key)}/puffs`;

  try {
    const res = await fetch(firestoreUrl);
    const data: any = await res.json();
    const documents = data.documents || [];

    const puffs = documents.map((doc: any) => {
      const parts = doc.name.split('/');
      const id = parts[parts.length - 1];
      const fields = doc.fields || {};
      return {
        id,
        timestamp: Number(fields.timestamp?.integerValue || 0),
        mood: fields.mood?.stringValue || undefined,
      };
    });

    return new Response(
      JSON.stringify({
        key,
        puffs,
        count: puffs.length,
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

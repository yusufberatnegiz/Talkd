interface ModerationRequest {
  text?: unknown;
}

interface ModerationResult {
  flagged?: unknown;
  categories?: Record<string, unknown>;
}

interface ModerationResponse {
  results?: ModerationResult[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAiApiKey) {
      return json({ error: 'Moderation is not configured.' }, 500);
    }

    const body = await request.json() as ModerationRequest;
    const text = typeof body.text === 'string' ? body.text.trim() : '';

    if (!text) {
      return json({ isSafe: true, isCrisis: false }, 200);
    }

    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'omni-moderation-latest',
        input: text,
      }),
    });

    if (!response.ok) {
      return json({ error: 'Moderation request failed.' }, 502);
    }

    const moderation = await response.json() as ModerationResponse;
    const result = moderation.results?.[0];
    const categories = result?.categories ?? {};
    const isCrisis = categories['self-harm'] === true ||
      categories['self-harm/intent'] === true ||
      categories['self-harm/instructions'] === true;

    return json({
      isSafe: result?.flagged !== true,
      isCrisis,
    }, 200);
  } catch {
    return json({ error: 'Moderation failed.' }, 500);
  }
});

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

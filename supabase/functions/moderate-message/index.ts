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

    const response = await moderateWithOpenAI(openAiApiKey, text);

    if (!response.ok) {
      const failure = await safeFailureBody(response);
      console.error('OpenAI moderation request failed', failure);
      return json({
        error: 'Moderation request failed.',
        status: response.status,
        reason: failure.reason,
        message: failure.message,
      }, 502);
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

async function moderateWithOpenAI(openAiApiKey: string, text: string): Promise<Response> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
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

    if (response.status !== 429 || attempt === maxAttempts) {
      return response;
    }

    await delay(retryDelayMs(response, attempt));
  }

  throw new Error('Moderation retry failed.');
}

function retryDelayMs(response: Response, attempt: number): number {
  const retryAfter = response.headers.get('retry-after');
  const retryAfterSeconds = retryAfter ? Number(retryAfter) : NaN;

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return Math.min(retryAfterSeconds * 1000, 2000);
  }

  return attempt * 750;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

async function safeFailureBody(response: Response): Promise<{
  status: number;
  reason: string;
  message: string;
}> {
  try {
    const body = await response.json() as {
      error?: {
        type?: unknown;
        code?: unknown;
        message?: unknown;
      };
    };
    const type = typeof body.error?.type === 'string' ? body.error.type : null;
    const code = typeof body.error?.code === 'string' ? body.error.code : null;
    const message = typeof body.error?.message === 'string'
      ? body.error.message.slice(0, 160)
      : 'OpenAI returned an error.';

    return {
      status: response.status,
      reason: code ?? type ?? 'openai_error',
      message,
    };
  } catch {
    return {
      status: response.status,
      reason: 'unreadable_openai_error',
      message: 'OpenAI returned an unreadable error.',
    };
  }
}

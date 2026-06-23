interface AuthUserResponse {
  id?: unknown;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const token = bearerToken(request);

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: 'Account deletion is not configured.' }, 500);
    }

    if (!token) {
      return json({ error: 'Authentication is required.' }, 401);
    }

    const userId = await authenticatedUserId(supabaseUrl, anonKey, token);
    if (!userId) {
      return json({ error: 'Authentication is required.' }, 401);
    }

    const deleteResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    if (!deleteResponse.ok) {
      return json({ error: 'Account could not be deleted.' }, 502);
    }

    return json({ deleted: true }, 200);
  } catch {
    return json({ error: 'Account deletion failed.' }, 500);
  }
});

function bearerToken(request: Request): string | null {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return null;
  return authorization.slice('Bearer '.length).trim() || null;
}

async function authenticatedUserId(
  supabaseUrl: string,
  anonKey: string,
  token: string
): Promise<string | null> {
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) return null;

  const user = await response.json() as AuthUserResponse;
  return typeof user.id === 'string' ? user.id : null;
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

interface VerifyPurchaseRequest {
  transactionId?: unknown;
}

interface AuthUserResponse {
  id?: unknown;
}

interface AppleTransactionInfoResponse {
  signedTransactionInfo?: unknown;
}

interface AppleTransactionPayload {
  appAccountToken?: unknown;
  bundleId?: unknown;
  environment?: unknown;
  expiresDate?: unknown;
  originalTransactionId?: unknown;
  productId?: unknown;
  revocationDate?: unknown;
  transactionId?: unknown;
}

interface StoredEntitlement {
  latest_transaction_id?: unknown;
}

const PREMIUM_PRODUCT_IDS = new Set(['talkd_premium_monthly', 'talkd_premium_yearly']);
const TRANSACTION_NOT_FOUND = 4040010;

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
    const issuerId = Deno.env.get('APPLE_IAP_ISSUER_ID');
    const keyId = Deno.env.get('APPLE_IAP_KEY_ID');
    const privateKey = Deno.env.get('APPLE_IAP_PRIVATE_KEY');
    const bundleId = Deno.env.get('APPLE_BUNDLE_ID');
    const token = bearerToken(request);

    if (!supabaseUrl || !anonKey || !serviceRoleKey || !issuerId || !keyId || !privateKey || !bundleId) {
      return json({ error: 'Apple purchase verification is not configured.' }, 500);
    }

    if (!token) {
      return json({ error: 'Authentication is required.' }, 401);
    }

    const userId = await authenticatedUserId(supabaseUrl, anonKey, token);
    if (!userId) {
      return json({ error: 'Authentication is required.' }, 401);
    }

    const body = await safeRequestBody(request);
    const requestedTransactionId = typeof body.transactionId === 'string'
      ? body.transactionId.trim()
      : '';
    const transactionId = requestedTransactionId || await storedTransactionId(
      supabaseUrl,
      serviceRoleKey,
      userId,
    );

    if (!transactionId) {
      return json({ verified: false, active: false, productId: null, expiresAt: null }, 200);
    }

    const appleToken = await createAppleApiToken({ issuerId, keyId, privateKey, bundleId });
    const appleResult = await getAppleTransaction(transactionId, appleToken);
    if (!appleResult) {
      return json({ verified: false, active: false, productId: null, expiresAt: null }, 200);
    }

    const payload = decodeJwsPayload(appleResult.signedTransactionInfo);
    const verified = validateTransaction(payload, { bundleId, userId });
    if (!verified.ok) {
      return json({ error: verified.error }, 403);
    }

    const expiresAt = new Date(verified.expiresDate).toISOString();
    const revokedAt = verified.revocationDate === null
      ? null
      : new Date(verified.revocationDate).toISOString();
    const now = new Date().toISOString();

    const upsertResponse = await fetch(
      `${supabaseUrl}/rest/v1/premium_entitlements?on_conflict=user_id`,
      {
        method: 'POST',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: verified.productId,
          original_transaction_id: verified.originalTransactionId,
          latest_transaction_id: verified.transactionId,
          environment: verified.environment,
          expires_at: expiresAt,
          revoked_at: revokedAt,
          verified_at: now,
          updated_at: now,
        }),
      },
    );

    if (!upsertResponse.ok) {
      console.error('Premium entitlement upsert failed', upsertResponse.status);
      return json({ error: 'Premium access could not be saved.' }, 502);
    }

    return json({
      verified: true,
      active: revokedAt === null && verified.expiresDate > Date.now(),
      productId: verified.productId,
      expiresAt,
    }, 200);
  } catch (error: unknown) {
    console.error('Apple purchase verification failed', safeErrorMessage(error));
    return json({ error: 'Apple purchase verification failed.' }, 500);
  }
});

async function getAppleTransaction(
  transactionId: string,
  token: string,
): Promise<{ signedTransactionInfo: string } | null> {
  const hosts = [
    'https://api.storekit.apple.com',
    'https://api.storekit-sandbox.apple.com',
  ];

  for (const host of hosts) {
    const response = await fetch(
      `${host}/inApps/v1/transactions/${encodeURIComponent(transactionId)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (response.ok) {
      const body = await response.json() as AppleTransactionInfoResponse;
      if (typeof body.signedTransactionInfo !== 'string') {
        throw new Error('Apple response did not include signed transaction information.');
      }
      return { signedTransactionInfo: body.signedTransactionInfo };
    }

    const errorBody = await safeJson(response);
    if (host.includes('api.storekit.apple.com') && errorBody.errorCode === TRANSACTION_NOT_FOUND) {
      continue;
    }

    if (response.status === 404 && errorBody.errorCode === TRANSACTION_NOT_FOUND) {
      return null;
    }

    throw new Error(`Apple transaction lookup failed with status ${response.status}.`);
  }

  return null;
}

function validateTransaction(
  payload: AppleTransactionPayload,
  expected: { bundleId: string; userId: string },
):
  | {
    ok: true;
    environment: 'Production' | 'Sandbox';
    expiresDate: number;
    originalTransactionId: string;
    productId: string;
    revocationDate: number | null;
    transactionId: string;
  }
  | { ok: false; error: string } {
  if (payload.bundleId !== expected.bundleId) {
    return { ok: false, error: 'The Apple purchase belongs to a different app.' };
  }
  if (payload.appAccountToken !== expected.userId) {
    return { ok: false, error: 'The Apple purchase belongs to a different account.' };
  }
  if (typeof payload.productId !== 'string' || !PREMIUM_PRODUCT_IDS.has(payload.productId)) {
    return { ok: false, error: 'The Apple product is not a Talkd Premium subscription.' };
  }
  if (payload.environment !== 'Production' && payload.environment !== 'Sandbox') {
    return { ok: false, error: 'Apple returned an unknown purchase environment.' };
  }
  if (typeof payload.expiresDate !== 'number' || !Number.isFinite(payload.expiresDate)) {
    return { ok: false, error: 'Apple did not return a subscription expiration date.' };
  }
  if (typeof payload.originalTransactionId !== 'string' || typeof payload.transactionId !== 'string') {
    return { ok: false, error: 'Apple did not return valid transaction identifiers.' };
  }
  if (payload.revocationDate !== undefined && typeof payload.revocationDate !== 'number') {
    return { ok: false, error: 'Apple returned an invalid revocation date.' };
  }

  return {
    ok: true,
    environment: payload.environment,
    expiresDate: payload.expiresDate,
    originalTransactionId: payload.originalTransactionId,
    productId: payload.productId,
    revocationDate: payload.revocationDate ?? null,
    transactionId: payload.transactionId,
  };
}

async function createAppleApiToken(input: {
  bundleId: string;
  issuerId: string;
  keyId: string;
  privateKey: string;
}): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = encodeJson({ alg: 'ES256', kid: input.keyId, typ: 'JWT' });
  const payload = encodeJson({
    iss: input.issuerId,
    iat: issuedAt,
    exp: issuedAt + 300,
    aud: 'appstoreconnect-v1',
    bid: input.bundleId,
  });
  const signingInput = `${header}.${payload}`;
  const key = await importApplePrivateKey(input.privateKey);
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(signingInput),
  );
  return `${signingInput}.${base64Url(new Uint8Array(signature))}`;
}

async function importApplePrivateKey(pem: string): Promise<CryptoKey> {
  const normalized = pem.replaceAll('\\n', '\n');
  const base64 = normalized
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  const bytes = Uint8Array.from(atob(base64), character => character.charCodeAt(0));
  return await crypto.subtle.importKey(
    'pkcs8',
    bytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );
}

function decodeJwsPayload(jws: string): AppleTransactionPayload {
  const parts = jws.split('.');
  if (parts.length !== 3) throw new Error('Apple returned an invalid signed transaction.');
  return JSON.parse(decodeBase64Url(parts[1])) as AppleTransactionPayload;
}

function encodeJson(value: Record<string, unknown>): string {
  return base64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function base64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
}

function decodeBase64Url(value: string): string {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, character => character.charCodeAt(0)));
}

async function storedTransactionId(
  supabaseUrl: string,
  serviceRoleKey: string,
  userId: string,
): Promise<string> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/premium_entitlements?user_id=eq.${encodeURIComponent(userId)}&select=latest_transaction_id&limit=1`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );
  if (!response.ok) throw new Error('Stored entitlement lookup failed.');
  const rows = await response.json() as StoredEntitlement[];
  return typeof rows[0]?.latest_transaction_id === 'string' ? rows[0].latest_transaction_id : '';
}

async function authenticatedUserId(
  supabaseUrl: string,
  anonKey: string,
  token: string,
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

async function safeRequestBody(request: Request): Promise<VerifyPurchaseRequest> {
  try {
    return await request.json() as VerifyPurchaseRequest;
  } catch {
    return {};
  }
}

async function safeJson(response: Response): Promise<{ errorCode?: unknown }> {
  try {
    return await response.json() as { errorCode?: unknown };
  } catch {
    return {};
  }
}

function bearerToken(request: Request): string | null {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return null;
  return authorization.slice('Bearer '.length).trim() || null;
}

function safeErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown verification error.';
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

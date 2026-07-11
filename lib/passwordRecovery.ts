type PasswordRecoveryParams =
  | { kind: 'tokens'; accessToken: string; refreshToken: string }
  | { kind: 'code'; code: string };

type PasswordRecoveryListener = (active: boolean) => void;

let passwordRecoveryActive = false;
const listeners = new Set<PasswordRecoveryListener>();

function readUrlParams(url: string): URLSearchParams {
  const params = new URLSearchParams();
  const queryStart = url.indexOf('?');
  const hashStart = url.indexOf('#');

  if (queryStart >= 0) {
    const queryEnd = hashStart >= 0 ? hashStart : url.length;
    const queryParams = new URLSearchParams(url.slice(queryStart + 1, queryEnd));
    queryParams.forEach((value, key) => params.set(key, value));
  }

  if (hashStart >= 0) {
    const hashParams = new URLSearchParams(url.slice(hashStart + 1));
    hashParams.forEach((value, key) => params.set(key, value));
  }

  return params;
}

export function getPasswordRecoveryParamsFromUrl(url: string): PasswordRecoveryParams | null {
  const params = readUrlParams(url);
  if (params.get('type') !== 'recovery') return null;

  const code = params.get('code');
  if (code) return { kind: 'code', code };

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (accessToken && refreshToken) {
    return { kind: 'tokens', accessToken, refreshToken };
  }

  return null;
}

export function setPasswordRecoveryActive(active: boolean): void {
  if (passwordRecoveryActive === active) return;
  passwordRecoveryActive = active;
  listeners.forEach(listener => listener(active));
}

export function markPasswordRecoveryUrl(url: string | null): boolean {
  if (!url || !getPasswordRecoveryParamsFromUrl(url)) return false;
  setPasswordRecoveryActive(true);
  return true;
}

export function subscribePasswordRecoveryActive(listener: PasswordRecoveryListener): () => void {
  listeners.add(listener);
  listener(passwordRecoveryActive);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Global fetch interceptor.
 *
 * Wraps window.fetch so that every 401 Unauthorized response from an
 * authenticated request (one that carries an Authorization: Bearer header)
 * automatically clears the stored session and redirects the user to /login.
 *
 * Call setupFetchInterceptor() once, before the React tree mounts (main.tsx).
 */

const SESSION_KEY = import.meta.env.VITE_SESSION_KEY as string | undefined;

const AUTH_PATHS = ['/login', '/register', '/admin'];

function isAlreadyOnAuthPage(): boolean {
  return AUTH_PATHS.some(p => window.location.pathname.startsWith(p));
}

function hadBearerToken(init?: RequestInit): boolean {
  if (!init?.headers) return false;
  let auth: string | null = null;
  if (init.headers instanceof Headers) {
    auth = init.headers.get('Authorization');
  } else if (Array.isArray(init.headers)) {
    const pair = (init.headers as string[][]).find(([k]) => k.toLowerCase() === 'authorization');
    auth = pair?.[1] ?? null;
  } else {
    const h = init.headers as Record<string, string>;
    auth = h['Authorization'] ?? h['authorization'] ?? null;
  }
  return typeof auth === 'string' && auth.startsWith('Bearer ');
}

function clearStoredSession() {
  if (SESSION_KEY) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    // Fallback: clear any key that looks like a session
    Object.keys(localStorage).forEach(key => {
      if (key.includes('session') || key.includes('auth') || key.includes('token')) {
        localStorage.removeItem(key);
      }
    });
  }
}

export function setupFetchInterceptor(): void {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const response = await originalFetch(input, init);

    if (response.status === 401 && hadBearerToken(init) && !isAlreadyOnAuthPage()) {
      clearStoredSession();
      // Hard navigate so all React state is reset cleanly
      window.location.href = '/login';
    }

    return response;
  };
}

/**
 * Django API client — centralized fetch wrapper.
 * - Uses httpOnly cookies (credentials: 'include') for JWT auth.
 * - Django must set CORS: Access-Control-Allow-Credentials=true and a
 *   specific origin (not *), and cookies with SameSite=None; Secure in prod.
 *
 * Toggle Django mode via VITE_USE_DJANGO_API=true in .env.
 * Override base URL via VITE_API_BASE_URL (defaults to http://localhost:8000/api).
 */

export const DJANGO_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  enabled: import.meta.env.VITE_USE_DJANGO_API === 'true',
};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

interface FetchOpts {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Set false for endpoints that don't require auth (login, register). */
  withCredentials?: boolean;
}

/**
 * Centralized API call. Automatically:
 *  - prefixes baseUrl
 *  - sends/receives httpOnly cookies
 *  - JSON-encodes the body
 *  - throws ApiError on non-2xx with parsed payload
 *  - dispatches a window 'auth:unauthorized' event on 401 so the app can react
 */
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export async function apiFetch<T = unknown>(
  endpoint: string,
  opts: FetchOpts = {},
  isRetry = false
): Promise<T> {
  const { method = 'GET', body, headers = {}, signal, withCredentials = true } = opts;

  const url = `${DJANGO_CONFIG.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const isFormData = body instanceof FormData;

  const init: RequestInit = {
    method,
    signal,
    credentials: withCredentials ? 'include' : 'same-origin',
    headers: {
      Accept: 'application/json',
      ...(!isFormData && body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
  };

  if (body !== undefined) {
    init.body = isFormData ? (body as FormData) : (typeof body === 'string' ? body : JSON.stringify(body));
  }

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err) {
    throw new ApiError(0, 'Network error — is the Django backend reachable?', err);
  }

  // Empty 204 / no-content
  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    if (res.status === 401 && !isRetry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/token/refresh')) {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = fetch(`${DJANGO_CONFIG.baseUrl}/auth/token/refresh/`, {
          method: 'POST',
          credentials: 'include'
        }).then(r => {
          isRefreshing = false;
          return r.ok;
        }).catch(() => {
          isRefreshing = false;
          return false;
        });
      }
      const success = await refreshPromise;
      if (success) {
        return apiFetch<T>(endpoint, opts, true);
      } else {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    } else if (res.status === 401 && !endpoint.includes('/auth/token/refresh')) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    if (res.status === 403) {
      window.dispatchEvent(new CustomEvent('auth:forbidden'));
    }

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await res.json().catch(() => null)
      : await res.text().catch(() => null);

    const message =
      (data && typeof data === 'object' && (data as any).detail) ||
      (data && typeof data === 'object' && (data as any).message) ||
      (typeof data === 'string' ? data : null) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, data);
  }

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  return data as T;
}

export const http = {
  get: <T>(endpoint: string, opts?: Omit<FetchOpts, 'method' | 'body'>) =>
    apiFetch<T>(endpoint, { ...opts, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, opts?: Omit<FetchOpts, 'method' | 'body'>) =>
    apiFetch<T>(endpoint, { ...opts, method: 'POST', body }),
  put: <T>(endpoint: string, body?: unknown, opts?: Omit<FetchOpts, 'method' | 'body'>) =>
    apiFetch<T>(endpoint, { ...opts, method: 'PUT', body }),
  patch: <T>(endpoint: string, body?: unknown, opts?: Omit<FetchOpts, 'method' | 'body'>) =>
    apiFetch<T>(endpoint, { ...opts, method: 'PATCH', body }),
  delete: <T>(endpoint: string, opts?: Omit<FetchOpts, 'method' | 'body'>) =>
    apiFetch<T>(endpoint, { ...opts, method: 'DELETE' }),
};

/**
 * Secure network layer: no URLs, endpoints, or auth details are exposed to the console
 * or in error messages shown to users. Use for all app API calls.
 */

const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV === true;

/** Strip URLs, paths, and technical terms from a message so it's safe to show to users */
export function sanitizeMessage(message: string): string {
  if (!message || typeof message !== 'string') return 'Something went wrong.';
  let s = message;
  // Remove URL-like strings
  s = s.replace(/https?:\/\/[^\s]+/gi, '');
  s = s.replace(/\/api\/[^\s]*/gi, '');
  s = s.replace(/\b(fetch|XMLHttpRequest|CORS|Authorization|Bearer)\b/gi, '');
  s = s.replace(/\s+/g, ' ').trim();
  return s.length > 0 ? s : 'Something went wrong.';
}

/** Generic user-facing message for network failures - no endpoint or URL */
export const NETWORK_ERROR_MESSAGE = 'Connection error. Please try again.';

/**
 * Perform a fetch without exposing the URL or request details in errors or console.
 * Use this for all API calls so network details are not visible to users.
 */
export async function secureFetch(
  baseUrl: string,
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      },
    });
    return res;
  } catch (err) {
    if (isDev) {
      console.warn('Request failed'); // No URL or error object
    }
    throw new Error(NETWORK_ERROR_MESSAGE);
  }
}

/**
 * Parse JSON from a response and return a user-safe error message if not ok.
 * Never includes URL or endpoint in the returned message.
 */
export async function parseJsonResponse<T>(res: Response): Promise<{ ok: boolean; data: T; userMessage?: string }> {
  const data = await res.json().catch(() => ({} as T));
  if (res.ok) {
    return { ok: true, data: data as T };
  }
  const raw = (data && typeof data === 'object' && data.message) ? String(data.message) : '';
  const userMessage = raw ? sanitizeMessage(raw) : NETWORK_ERROR_MESSAGE;
  return { ok: false, data: data as T, userMessage };
}

/** Opaque action codes for the single gateway – not exposed in UI or errors */
const GATEWAY_ACTION = {
  LOGIN: 'l',
  SIGNUP: 'u',
  UPDATE_HINTS: 'gh',
  UPDATE_POINTS: 'gp',
  UPDATE_PREMIUM: 'gpr',
  UPDATE_LEVEL_PASSED: 'gl',
  CREATE_PURCHASE: 'ph',
  GET_PURCHASES: 'pg',
  GET_USER: 'gu',
  GET_PRICE_OFFER: 'go',
  GET_GAME_CONFIG: 'gc',
  GOOGLE_SIGNIN: 'g',
  FORGOT_PASSWORD: 'fp',
  RESET_PASSWORD: 'rp',
  DAILY_STATUS: 'ds',
  DAILY_COMPLETE: 'dc',
  LEADERBOARD: 'lb',
  RAZORPAY_ORDER: 'ro',
  RAZORPAY_VERIFY: 'rv',
} as const;

/**
 * Single gateway call: POST /api/r with { action, params }.
 * Network tab shows one URL and opaque action codes instead of many endpoints.
 */
export async function gatewayFetch(
  baseUrl: string,
  action: string,
  params: Record<string, unknown> = {}
): Promise<Response> {
  const url = `${baseUrl.replace(/\/$/, '')}/api/r`;
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, params }),
    });
  } catch (err) {
    if (isDev) {
      console.warn('Request failed');
    }
    throw new Error(NETWORK_ERROR_MESSAGE);
  }
}

export { GATEWAY_ACTION };

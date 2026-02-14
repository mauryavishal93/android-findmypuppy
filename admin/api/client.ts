/**
 * Admin API client. All requests to /api/admin/* include the stored JWT.
 * Errors never expose URLs, paths, or auth details to the UI or console.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const getToken = () => localStorage.getItem('findMyPuppy_adminToken');

function sanitizeAdminError(msg: string, status: number): string {
  if (!msg || typeof msg !== 'string') return 'Request failed.';
  const s = msg
    .replace(/https?:\/\/[^\s]+/gi, '')
    .replace(/\/api\/[^\s]*/gi, '')
    .replace(/\b(fetch|Authorization|Bearer|token)\b/gi, '');
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length > 0) return t;
  if (status === 401) return 'Session expired. Please sign in again.';
  if (status === 403) return 'You don\'t have permission for this.';
  return 'Request failed.';
}

export async function adminFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const url = `${API_BASE}/api/admin${path}`;
  return fetch(url, { ...options, headers });
}

export async function adminJson<T>(path: string, options?: RequestInit): Promise<{ success: boolean; message?: string } & T> {
  const res = await adminFetch(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const safe = sanitizeAdminError((data && data.message) ? String(data.message) : '', res.status);
    throw new Error(safe);
  }
  return data as { success: boolean; message?: string } & T;
}

export function setAdminToken(token: string) {
  localStorage.setItem('findMyPuppy_adminToken', token);
}

export function clearAdminToken() {
  localStorage.removeItem('findMyPuppy_adminToken');
}

export function hasAdminToken(): boolean {
  return !!getToken();
}

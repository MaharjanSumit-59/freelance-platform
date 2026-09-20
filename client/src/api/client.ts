const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
const TOKEN_KEY = 'freelancehub_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });


  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(body?.error ?? 'Something went wrong.', res.status);
  }
  return body as T;
}

// For protected binary downloads (e.g. a proposal's CV) that need the auth
// header but aren't JSON, so apiFetch's response handling doesn't apply.
export async function apiFetchBlob(path: string): Promise<{ blob: Blob; filename: string }> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const isJson = res.headers.get('content-type')?.includes('application/json');
    const body = isJson ? await res.json() : null;
    throw new ApiError(body?.error ?? 'Could not download this file.', res.status);
  }
  const disposition = res.headers.get('content-disposition') ?? '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? 'download.pdf';
  const blob = await res.blob();
  return { blob, filename };
}
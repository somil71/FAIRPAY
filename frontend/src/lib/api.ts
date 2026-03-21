// src/lib/api.ts
// Single place for all API calls. Handles auth headers, error parsing, timeouts.

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const TIMEOUT_MS = 8000;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  address?: string,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (address) headers['x-wallet-address'] = address;

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      let msg = `API error ${res.status}`;
      try { const err = await res.json(); msg = err.error ?? err.message ?? msg; } catch {}
      throw new ApiError(res.status, msg);
    }

    return res.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;
    if ((err as Error).name === 'AbortError') throw new ApiError(0, 'Request timed out');
    throw new ApiError(0, 'Network error — backend may be offline');
  }
}

export const api = {
  get:    <T>(path: string, address?: string) =>
    apiFetch<T>(path, { method: 'GET' }, address),
  post:   <T>(path: string, body: unknown, address?: string) =>
    apiFetch<T>(path, { 
      method: 'POST', 
      body: JSON.stringify(body, (_k, v) => typeof v === 'bigint' ? v.toString() : v) 
    }, address),
  put:    <T>(path: string, body: unknown, address?: string) =>
    apiFetch<T>(path, { 
      method: 'PUT', 
      body: JSON.stringify(body, (_k, v) => typeof v === 'bigint' ? v.toString() : v) 
    }, address),
  patch:  <T>(path: string, body?: unknown, address?: string) =>
    apiFetch<T>(path, { 
      method: 'PATCH', 
      ...(body ? { body: JSON.stringify(body, (_k, v) => typeof v === 'bigint' ? v.toString() : v) } : {})
    }, address),
  delete: <T>(path: string, address?: string) =>
    apiFetch<T>(path, { method: 'DELETE' }, address),
};

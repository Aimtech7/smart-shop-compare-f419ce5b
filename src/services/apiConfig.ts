// API configuration — switch between mock and Django backend.
// Toggle via VITE_USE_DJANGO_API=true and VITE_API_BASE_URL=http://localhost:8000/api
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  useDjango: import.meta.env.VITE_USE_DJANGO_API === 'true',
  useMock: import.meta.env.VITE_USE_DJANGO_API !== 'true',
};

// Generic fetch wrapper for future real API calls
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'API request failed');
  }
  return res.json();
}

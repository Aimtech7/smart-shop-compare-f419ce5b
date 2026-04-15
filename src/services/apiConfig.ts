// API configuration — switch between mock and real backend
export const API_CONFIG = {
  // When connecting to a real backend, set VITE_API_BASE_URL in .env
  baseUrl: import.meta.env.VITE_API_BASE_URL || '',
  // When true, uses mock data; set to false when real backend is ready
  useMock: !import.meta.env.VITE_API_BASE_URL,
  // Supabase config (for future use)
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
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

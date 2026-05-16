/**
 * Auth via Django JWT (httpOnly cookies).
 * Expected backend endpoints (adjust to your URLconf if different):
 *   POST /auth/login/    { email, password } -> sets access+refresh cookies, returns user
 *   POST /auth/register/ { ... }             -> creates account, returns user
 *   POST /auth/logout/                       -> clears cookies
 *   POST /auth/refresh/                      -> rotates access cookie
 *   GET  /auth/me/                           -> returns current user
 */
import { http } from './client';
import { mappers } from './mappers';
import type { User, UserRole } from '@/types';

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload {
  email: string;
  password: string;
  password_confirm: string;
  name: string;
  phone: string;
  role: UserRole;
  business_name?: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    access: string;
    refresh: string;
    user: User;
  }
}

export const djangoAuth = {
  login: async (payload: LoginPayload) => {
    const res = await http.post<AuthResponse>('/auth/login/', payload);
    return {
      user: mappers.user(res.data.user),
      access: res.data.access,
      refresh: res.data.refresh,
      message: res.message
    };
  },

  register: async (payload: RegisterPayload) => {
    const res = await http.post<AuthResponse>('/auth/register/', payload);
    return {
      user: mappers.user(res.data.user),
      access: res.data?.access,
      refresh: res.data?.refresh,
      message: res.message
    };
  },

  logout: () => http.post<void>('/auth/logout/'),

  refresh: () => http.post<{ ok: true }>('/auth/refresh/'),

  me: async () => {
    const res = await http.get<any>('/auth/me/');
    return mappers.user(res);
  },
  
  requestPasswordReset: (email: string) => 
    http.post<{ detail: string }>('/auth/password/reset/', { email }),
  
  confirmPasswordReset: (payload: any) => 
    http.post<{ detail: string }>('/auth/password/reset/confirm/', payload),

  verifyEmail: (key: string) =>
    http.post<{ detail: string }>('/auth/registration/verify-email/', { key }),
};

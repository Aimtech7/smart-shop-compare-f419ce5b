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
    return { user: res.data.user };
  },

  register: async (payload: RegisterPayload) => {
    const res = await http.post<AuthResponse>('/auth/register/', payload);
    return { user: res.data.user };
  },

  logout: () => http.post<void>('/auth/logout/'),

  refresh: () => http.post<{ ok: true }>('/auth/refresh/'),

  me: () => http.get<User>('/auth/me/'),
};

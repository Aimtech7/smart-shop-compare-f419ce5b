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
  fullName: string;
  phone: string;
  role: UserRole;
  businessName?: string;
}

export const djangoAuth = {
  login: (payload: LoginPayload) =>
    http.post<{ user: User }>('/auth/login/', payload),

  register: (payload: RegisterPayload) =>
    http.post<{ user: User }>('/auth/register/', payload),

  logout: () => http.post<void>('/auth/logout/'),

  refresh: () => http.post<{ ok: true }>('/auth/refresh/'),

  me: () => http.get<User>('/auth/me/'),
};

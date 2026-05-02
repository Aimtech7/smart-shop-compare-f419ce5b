import { http } from './client';
import type { User } from '@/types';

export const djangoAdmin = {
  users: () => http.get<any>('/admin-panel/users/'),
  stats: () => http.get<any>('/admin-panel/stats/'),
  analytics: () => http.get<any>('/admin-panel/analytics/'),
  suspendUser: (id: string) => http.post<any>(`/admin-panel/users/${id}/suspend/`),
  activateUser: (id: string) => http.post<any>(`/admin-panel/users/${id}/activate/`),
};

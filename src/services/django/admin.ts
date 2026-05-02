import { http } from './client';
import type { User } from '@/types';

export const djangoAdmin = {
  // ── Users ──────────────────────────────────────────────────────────
  users: ()                        => http.get<any>('/admin/users/'),
  user: (id: string)               => http.get<any>(`/admin/users/${id}/`),
  suspendUser: (id: string)        => http.post<any>(`/admin/users/${id}/suspend/`),
  activateUser: (id: string)       => http.post<any>(`/admin/users/${id}/activate/`),

  // ── Sellers ────────────────────────────────────────────────────────
  verifySeller: (id: string)       => http.post<any>(`/admin/sellers/${id}/verify/`),

  // ── Stats & Analytics ──────────────────────────────────────────────
  stats: ()                        => http.get<any>('/admin/stats/'),
  analytics: ()                    => http.get<any>('/admin/analytics/'),

  // ── Orders ────────────────────────────────────────────────────────
  orders: ()                       => http.get<any>('/admin/orders/'),
  order: (id: string)              => http.get<any>(`/admin/orders/${id}/`),
  orderAction: (id: string, action: string) =>
    http.post<any>(`/admin/orders/${id}/action/`, { action }),

  // ── Products ───────────────────────────────────────────────────────
  products: ()                     => http.get<any>('/admin/products/'),

  // ── Customers (buyers only) ────────────────────────────────────────
  customers: ()                    => http.get<any>('/admin/customers/'),

  // ── Reported Content ───────────────────────────────────────────────
  reportedContent: ()              => http.get<any>('/admin/reported-content/'),
};

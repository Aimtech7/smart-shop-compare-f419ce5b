import { http } from './client';
import type { Product, Order } from '@/types';

export interface SellerDashboard {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  revenue: number;
}

export const djangoSeller = {
  list: async () => {
    const res = await http.get<any>('/seller/list/');
    const data = res.data || res.results || res;
    return data.map((s: any) => ({
      id: s.id,
      name: s.business_name,
      businessName: s.business_name,
      description: s.business_description || 'No description provided.',
      rating: parseFloat(s.rating_avg) || 0,
      totalSales: s.rating_count || 0, // Fallback to rating count if sales not available
      isVerified: s.verified || false,
      createdAt: s.created_at,
    }));
  },
  dashboard: async () => {
    const res = await http.get<any>('/seller/dashboard/');
    const d = res.data || res;
    return {
      totalProducts: d.total_products || 0,
      totalOrders: d.total_orders || 0,
      revenue: parseFloat(d.total_revenue) || 0,
      pendingOrders: d.pending_orders || 0,
      totalSales: d.total_orders || 0, // Aliased for consistency
    } as SellerDashboard;
  },
  products: async () => {
    const res = await http.get<any>('/seller/products/');
    const data = res.data || res;
    return data.map((p: any) => ({
      ...p,
      sku: p.SKU || p.sku,
      createdAt: p.created_at || p.createdAt,
      images: p.images ? p.images.map((img: any) => typeof img === 'string' ? img : img.image) : [],
    })) as Product[];
  },
  createProduct: (payload: Partial<Product> & { price: number; stock: number } | FormData) =>
    http.post<Product>('/products/', payload),
  updateProduct: (id: string, payload: Partial<Product> | FormData) =>
    http.patch<Product>(`/products/${id}/`, payload),
  deleteProduct: (id: string) => http.delete<void>(`/products/${id}/`),
  orders: async () => {
    const res = await http.get<any>('/orders/seller/');
    return res.data || res;
  },
  analytics: async () => {
    const res = await http.get<any>('/orders/seller/analytics/');
    return res.data || res;
  },
  createCategory: (name: string) => http.post<{id: string, name: string}>('/products/categories/create/', { name }),
};

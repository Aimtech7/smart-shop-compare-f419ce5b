import { http, fixImageUrl } from './client';
import { mappers } from './mappers';
import type { Product, StoreListing, Review } from '@/types';

export interface ProductListParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}

function toQuery(params?: Record<string, unknown>) {
  if (!params) return '';
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') usp.append(k, String(v));
  });
  const s = usp.toString();
  return s ? `?${s}` : '';
}

export const djangoProducts = {
  list: async (params?: ProductListParams) => {
    const res = await http.get<any>(
      `/products/${toQuery(params as Record<string, unknown>)}`
    );
    const data = Array.isArray(res) ? res : (res?.data || res?.results || []);
    return data.map(mappers.product);
  },
  get: async (id: string) => {
    const res = await http.get<any>(`/products/${id}/`);
    const p = res.data || res;
    return {
      ...mappers.product(p),
      listings: p.listings || []
    } as Product & { listings: StoreListing[] };
  },
  listings: (productId: string) =>
    http.get<StoreListing[]>(`/products/${productId}/listings/`),
  categories: async () => {
    const res = await http.get<any[]>('/products/categories/');
    return res.map(c => ({
      ...c,
      image: fixImageUrl(c.image)
    }));
  },
  reviews: (productId: string) =>
    http.get<Review[]>(`/products/${productId}/reviews/`),
};

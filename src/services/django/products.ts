import { http } from './client';
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
  list: (params?: ProductListParams) =>
    http.get<(Product & { listings: StoreListing[] })[]>(
      `/products/${toQuery(params as Record<string, unknown>)}`
    ),
  get: (id: string) =>
    http.get<Product & { listings: StoreListing[] }>(`/products/${id}/`),
  listings: (productId: string) =>
    http.get<StoreListing[]>(`/products/${productId}/listings/`),
  reviews: (productId: string) =>
    http.get<Review[]>(`/products/${productId}/reviews/`),
};

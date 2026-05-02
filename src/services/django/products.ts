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
  list: async (params?: ProductListParams) => {
    const res = await http.get<any>(
      `/products/${toQuery(params as Record<string, unknown>)}`
    );
    const data = Array.isArray(res) ? res : (res?.results || []);
    return data.map((p: any) => ({
      ...p,
      images: p.images ? p.images.map((img: any) => img.image) : [],
      category: p.category_name || p.category,
      listings: p.listings || [{
        id: p.id,
        productId: p.id,
        sellerId: p.seller,
        storeName: p.seller_business || p.seller_name || 'Unknown Store',
        price: parseFloat(p.price) || 0,
        stock: p.stock_qty || 0,
        sellerRating: parseFloat(p.avg_rating) || 4.5,
        isLowestPrice: true
      }]
    }));
  },
  get: async (id: string) => {
    const p = await http.get<any>(`/products/${id}/`);
    return {
      ...p,
      images: p.images ? p.images.map((img: any) => img.image) : [],
      category: p.category_name || p.category,
      listings: p.listings || [{
        id: p.id,
        productId: p.id,
        sellerId: p.seller,
        storeName: p.seller_business || p.seller_name || 'Unknown Store',
        price: parseFloat(p.price) || 0,
        stock: p.stock_qty || 0,
        sellerRating: parseFloat(p.avg_rating) || 4.5,
        isLowestPrice: true
      }]
    } as Product & { listings: StoreListing[] };
  },
  listings: (productId: string) =>
    http.get<StoreListing[]>(`/products/${productId}/listings/`),
  reviews: (productId: string) =>
    http.get<Review[]>(`/products/${productId}/reviews/`),
};

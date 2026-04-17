import { http } from './client';
import type { CartItem } from '@/types';

export const djangoCart = {
  get: () => http.get<CartItem[]>('/cart/'),
  add: (listingId: string, quantity = 1) =>
    http.post<CartItem>('/cart/add/', { listing_id: listingId, quantity }),
  update: (itemId: string, quantity: number) =>
    http.patch<CartItem>(`/cart/${itemId}/`, { quantity }),
  remove: (itemId: string) => http.delete<void>(`/cart/remove/${itemId}/`),
  clear: () => http.delete<void>('/cart/'),
};

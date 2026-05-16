import { http } from './client';
import { mappers } from './mappers';
import type { CartItem } from '@/types';

export const djangoCart = {
  get: async () => {
    const res = await http.get<any[]>('/cart/');
    return res.map(mappers.cartItem);
  },
  add: async (listingId: string, quantity = 1) => {
    const res = await http.post<any>('/cart/add/', { listing_id: listingId, quantity });
    return mappers.cartItem(res);
  },
  update: async (itemId: string, quantity: number) => {
    const res = await http.patch<any>(`/cart/${itemId}/`, { quantity });
    return mappers.cartItem(res);
  },
  remove: (itemId: string) => http.delete<void>(`/cart/remove/${itemId}/`),
  clear: () => http.delete<void>('/cart/'),
};

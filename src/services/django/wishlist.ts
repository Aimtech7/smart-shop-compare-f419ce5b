import { http } from './client';
import type { Product } from '@/types';

export const djangoWishlist = {
  get: async () => {
    const res = await http.get<any>('/wishlist/');
    return res.data || res.items || res || [];
  },
  
  add: (productId: string) => 
    http.post('/wishlist/add/', { product_id: productId }),
    
  remove: (productId: string) => 
    http.delete(`/wishlist/remove/${productId}/`),

  toggle: async (productId: string, isCurrentlyInWishlist: boolean) => {
    if (isCurrentlyInWishlist) {
      return djangoWishlist.remove(productId);
    } else {
      return djangoWishlist.add(productId);
    }
  }
};

import { http } from './client';
import { mappers } from './mappers';
import type { Product } from '@/types';

export const djangoWishlist = {
  get: async () => {
    const res = await http.get<any>('/wishlist/');
    const data = res.data || res.items || res || [];
    return data.map((item: any) => mappers.product(item.product || item));
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

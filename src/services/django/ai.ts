import { http } from './client';
import type { AIRecommendation } from '@/types';

export const djangoAI = {
  getRecommendation: async (productId: string) => {
    const res = await http.get<any>(`/ai/recommend/${productId}/`);
    const data = res.data || res;
    return {
      productId: data.product_id,
      listingId: data.listing_id || data.product_id,
      productName: data.product_name,
      storeName: data.seller_name || 'Recommended Store',
      price: parseFloat(data.price) || 0,
      rating: parseFloat(data.seller_rating) || 4.5,
      reason: data.reason || 'Top value based on price and seller reliability.',
      score: data.score || 95,
    } as AIRecommendation;
  },
  
  getBestValue: async (productId: string) => {
    // Re-use recommendation logic for best value
    return djangoAI.getRecommendation(productId);
  },

  getPersonalizedRecommendations: async (limit: number = 5) => {
    // This could call a general recommendation endpoint if available
    // For now, we'll return an empty array if no generic endpoint exists,
    // or we can fallback to featured products from djangoProducts
    try {
      const res = await http.get<any>(`/products/search/?q=featured&limit=${limit}`);
      return res.data || res.results || [];
    } catch {
      return [];
    }
  }
};

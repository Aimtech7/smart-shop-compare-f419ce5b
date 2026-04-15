import type { AIRecommendation } from '@/types';
import { withSimulation } from './simulation';
import { mockProducts_service } from './mockProducts';

export interface BestValueResult {
  recommendation: AIRecommendation;
  alternatives: AIRecommendation[];
  analysis: {
    priceWeight: number;
    ratingWeight: number;
    stockWeight: number;
    summary: string;
  };
}

function scoreListing(price: number, rating: number, stock: number, avgPrice: number): number {
  const priceScore = Math.max(0, 100 - ((price / avgPrice - 0.8) * 250));
  const ratingScore = (rating / 5) * 100;
  const stockScore = stock > 20 ? 100 : stock > 10 ? 75 : stock > 5 ? 50 : 25;
  return Math.round(priceScore * 0.45 + ratingScore * 0.35 + stockScore * 0.2);
}

export const mockAI = {
  /** Get best value recommendation for a product across all stores */
  async getBestValue(productId: string): Promise<BestValueResult | null> {
    return withSimulation(async () => {
      const product = await mockProducts_service.getProduct(productId);
      if (!product || product.listings.length === 0) return null;

      const avgPrice = product.listings.reduce((s, l) => s + l.price, 0) / product.listings.length;

      const scored = product.listings.map(l => ({
        listing: l,
        score: scoreListing(l.price, l.sellerRating, l.stock, avgPrice),
      })).sort((a, b) => b.score - a.score);

      const best = scored[0];
      const recommendation: AIRecommendation = {
        productId,
        listingId: best.listing.id,
        productName: product.name,
        storeName: best.listing.storeName,
        price: best.listing.price,
        rating: best.listing.sellerRating,
        score: best.score,
        reason: `Best combination of competitive pricing ($${best.listing.price}), high seller rating (${best.listing.sellerRating}★), and ${best.listing.stock > 20 ? 'excellent' : best.listing.stock > 10 ? 'good' : 'limited'} stock availability (${best.listing.stock} units).`,
      };

      const alternatives: AIRecommendation[] = scored.slice(1).map(s => ({
        productId,
        listingId: s.listing.id,
        productName: product.name,
        storeName: s.listing.storeName,
        price: s.listing.price,
        rating: s.listing.sellerRating,
        score: s.score,
        reason: s.listing.price < best.listing.price
          ? `Lower price at $${s.listing.price} but rated ${s.listing.sellerRating}★.`
          : `Higher rated seller (${s.listing.sellerRating}★) at $${s.listing.price}.`,
      }));

      return {
        recommendation,
        alternatives,
        analysis: {
          priceWeight: 0.45,
          ratingWeight: 0.35,
          stockWeight: 0.20,
          summary: `Analyzed ${product.listings.length} stores. ${best.listing.storeName} offers the best overall value with a score of ${best.score}/100.`,
        },
      };
    }, { delayMs: 800 }); // AI takes longer
  },

  /** Simple recommendation matching the existing api signature */
  async getRecommendation(productId: string): Promise<AIRecommendation | null> {
    const result = await this.getBestValue(productId);
    return result?.recommendation ?? null;
  },

  /** Get personalized recommendations based on browsing history (mock) */
  async getPersonalizedRecommendations(limit = 4) {
    return withSimulation(() => {
      const allProducts = mockProducts_service.getAllProducts();
      const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, limit);
    }, { delayMs: 600 });
  },
};

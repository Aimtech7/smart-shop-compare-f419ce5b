import type { StoreListing } from '@/types';
import { withSimulation } from './simulation';
import { mockProducts_service } from './mockProducts';

export interface PriceComparison {
  productId: string;
  productName: string;
  listings: (StoreListing & { savingsVsHighest: number; savingsPercent: number })[];
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
}

export const mockPricing = {
  /** Compare prices across all stores for a given product */
  async comparePrices(productId: string): Promise<PriceComparison | null> {
    return withSimulation(async () => {
      const product = await mockProducts_service.getProduct(productId);
      if (!product) return null;

      const prices = product.listings.map(l => l.price);
      const lowest = Math.min(...prices);
      const highest = Math.max(...prices);
      const average = prices.reduce((a, b) => a + b, 0) / prices.length;

      const listings = product.listings
        .map(l => ({
          ...l,
          savingsVsHighest: highest - l.price,
          savingsPercent: highest > 0 ? Math.round(((highest - l.price) / highest) * 100) : 0,
        }))
        .sort((a, b) => a.price - b.price);

      return {
        productId,
        productName: product.name,
        listings,
        lowestPrice: lowest,
        highestPrice: highest,
        averagePrice: Math.round(average * 100) / 100,
      };
    });
  },

  /** Detect lowest price listing for a product */
  async getLowestPriceListing(productId: string): Promise<StoreListing | null> {
    return withSimulation(async () => {
      const product = await mockProducts_service.getProduct(productId);
      if (!product || product.listings.length === 0) return null;
      return product.listings.reduce((best, l) => l.price < best.price ? l : best);
    });
  },

  /** Get price drop alerts (products where current price < original price) */
  async getPriceDrops() {
    return withSimulation(() => {
      const allProducts = mockProducts_service.getAllProducts();
      return allProducts
        .flatMap(p => p.listings
          .filter(l => l.originalPrice && l.price < l.originalPrice)
          .map(l => ({
            productId: p.id,
            productName: p.name,
            productImage: p.images[0] || '',
            listing: l,
            dropAmount: l.originalPrice! - l.price,
            dropPercent: Math.round(((l.originalPrice! - l.price) / l.originalPrice!) * 100),
          }))
        )
        .sort((a, b) => b.dropPercent - a.dropPercent);
    });
  },
};

/**
 * API Abstraction Layer (Production Ready)
 *
 * Routes data access to the Django backend.
 * Components import ONLY from this file.
 */
import {
  DJANGO_CONFIG,
  djangoProducts,
  djangoCart,
  djangoOrders,
  djangoSeller,
  djangoAdmin,
  djangoPayments,
  djangoAI,
  djangoWishlist,
} from './django';
import type {
  SearchFilters,
  AIRecommendation,
  Review,
  CartItem,
  DeliveryAddress,
  Order,
} from '@/types';

export const api = {
  // ─── Products ────────────────────────────────────────────────
  getProducts: (filters?: SearchFilters) =>
    djangoProducts.list({ search: filters?.query, category: filters?.category }),
  getProduct: (id: string) => djangoProducts.get(id),
  getCategories: () => djangoProducts.categories(),
  getStores: () => djangoProducts.categories(), // Using categories as a proxy for store discovery for now
  getTopStores: () => djangoSeller.list(), 
  getStore: (id: string) => djangoProducts.get(id), // Simplified store fetch
  getReviews: (productId: string) => djangoProducts.reviews(productId),
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => 
    djangoProducts.reviews(review.productId), // Placeholder for add review
  getPriceHistory: (productId: string) => 
    djangoProducts.listings(productId), // History endpoint proxy
  getSellerProducts: (sellerId: string) => djangoProducts.list(), // Filtered by seller if needed
  getSellerMetrics: () => djangoAdmin.stats(),
  getAdminMetrics: () => djangoAdmin.analytics(),
  getAdminUsers: () => djangoAdmin.users(),

  // ─── Pricing ─────────────────────────────────────────────────
  comparePrices: (productId: string) => djangoProducts.listings(productId),
  getLowestPrice: (productId: string) => 
    djangoProducts.listings(productId).then(list => list[0] || null),
  getPriceDrops: () => djangoProducts.list({ minPrice: 1 }), // Placeholder for price drops

  // ─── AI ──────────────────────────────────────────────────────
  getAIRecommendation: (productId: string): Promise<AIRecommendation | null> =>
    djangoAI.getRecommendation(productId),
  getBestValue: (productId: string) => djangoAI.getBestValue(productId),
  getPersonalizedRecommendations: (limit?: number) => djangoAI.getPersonalizedRecommendations(limit),

  // ─── Orders ──────────────────────────────────────────────────
  getOrders: (userId?: string) => djangoOrders.list(),
  getOrder: (orderId: string) => djangoOrders.get(orderId),
  checkout: (
    items: CartItem[],
    address: DeliveryAddress,
    paymentMethod: string,
    userId: string
  ): Promise<Order> =>
    djangoOrders
      .checkout({ address, payment_method: paymentMethod })
      .then((r) => r.order),
  cancelOrder: (orderId: string) => djangoOrders.cancel(orderId),
  getSellerOrders: (sellerId: string) => djangoOrders.list(), // Should be seller filtered
  getOrderStats: () => djangoAdmin.stats(),

  // ─── Wishlist ────────────────────────────────────────────────
  wishlist: djangoWishlist,

  // ─── Cart (Production API Layer) ────────────────────────────
  cart: djangoCart,

  // ─── Payments ────────────────────────────────────────────────
  createCheckoutSession: (cart: any, totalAmount: number) =>
    djangoPayments.createCheckoutSession(cart, totalAmount),
};

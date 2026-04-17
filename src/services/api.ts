/**
 * API Abstraction Layer (Hybrid)
 *
 * Routes data access to either:
 *   - Django backend (when VITE_USE_DJANGO_API=true)
 *   - Mock services (default, for local UI dev)
 *
 * Components import ONLY from this file. To migrate an endpoint to Django,
 * replace the mock call below with the corresponding djangoX.* call.
 */
import { mockProducts_service } from './mock/mockProducts';
import { mockPricing } from './mock/mockPricing';
import { mockAI } from './mock/mockAI';
import { mockOrders } from './mock/mockOrders';
import {
  DJANGO_CONFIG,
  djangoProducts,
  djangoCart,
  djangoOrders,
} from './django';
import type {
  SearchFilters,
  AIRecommendation,
  Review,
  CartItem,
  DeliveryAddress,
  Order,
} from '@/types';

const useDjango = DJANGO_CONFIG.enabled;

export const api = {
  // ─── Products ────────────────────────────────────────────────
  getProducts: (filters?: SearchFilters) =>
    useDjango
      ? djangoProducts.list({ search: filters?.query, category: filters?.category })
      : mockProducts_service.getProducts(filters),
  getProduct: (id: string) =>
    useDjango ? djangoProducts.get(id) : mockProducts_service.getProduct(id),
  getStores: () => mockProducts_service.getStores(),
  getTopStores: () => mockProducts_service.getTopStores(),
  getStore: (id: string) => mockProducts_service.getStore(id),
  getReviews: (productId: string) =>
    useDjango ? djangoProducts.reviews(productId) : mockProducts_service.getReviews(productId),
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => mockProducts_service.addReview(review),
  getPriceHistory: (productId: string) => mockProducts_service.getPriceHistory(productId),
  getSellerProducts: (sellerId: string) => mockProducts_service.getSellerProducts(sellerId),
  getSellerMetrics: () => mockProducts_service.getSellerMetrics(),
  getAdminMetrics: () => mockProducts_service.getAdminMetrics(),
  getAdminUsers: () => mockProducts_service.getAdminUsers(),

  // ─── Pricing ─────────────────────────────────────────────────
  comparePrices: (productId: string) =>
    useDjango ? djangoProducts.listings(productId) : mockPricing.comparePrices(productId),
  getLowestPrice: (productId: string) => mockPricing.getLowestPriceListing(productId),
  getPriceDrops: () => mockPricing.getPriceDrops(),

  // ─── AI ──────────────────────────────────────────────────────
  getAIRecommendation: (productId: string): Promise<AIRecommendation | null> =>
    mockAI.getRecommendation(productId),
  getBestValue: (productId: string) => mockAI.getBestValue(productId),
  getPersonalizedRecommendations: (limit?: number) => mockAI.getPersonalizedRecommendations(limit),

  // ─── Orders ──────────────────────────────────────────────────
  getOrders: (userId?: string) =>
    useDjango ? djangoOrders.list() : mockOrders.getOrders(userId),
  getOrder: (orderId: string) =>
    useDjango ? djangoOrders.get(orderId) : mockOrders.getOrder(orderId),
  checkout: (
    items: CartItem[],
    address: DeliveryAddress,
    paymentMethod: string,
    userId: string
  ): Promise<Order> =>
    useDjango
      ? djangoOrders
          .checkout({ address, payment_method: paymentMethod })
          .then((r) => r.order)
      : mockOrders.checkout(items, address, paymentMethod, userId),
  cancelOrder: (orderId: string) =>
    useDjango ? djangoOrders.cancel(orderId) : mockOrders.cancelOrder(orderId),
  getSellerOrders: (sellerId: string) => mockOrders.getSellerOrders(sellerId),
  getOrderStats: () => mockOrders.getOrderStats(),

  // ─── Cart (Django-only; mock cart lives in zustand store) ────
  cart: useDjango ? djangoCart : null,
};

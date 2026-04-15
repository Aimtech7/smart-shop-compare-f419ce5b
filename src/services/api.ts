/**
 * API Abstraction Layer
 * 
 * Centralizes ALL data access. Components import ONLY from this file.
 * Currently delegates to mock services. When a real backend is connected,
 * swap implementations here — no component changes needed.
 */
import { mockProducts_service } from './mock/mockProducts';
import { mockPricing } from './mock/mockPricing';
import { mockAI } from './mock/mockAI';
import { mockOrders } from './mock/mockOrders';
import type { Product, StoreListing, SearchFilters, AIRecommendation, User, Review, CartItem, DeliveryAddress, Order } from '@/types';

export const api = {
  // ─── Products ────────────────────────────────────────────────
  getProducts: (filters?: SearchFilters) => mockProducts_service.getProducts(filters),
  getProduct: (id: string) => mockProducts_service.getProduct(id),
  getStores: () => mockProducts_service.getStores(),
  getTopStores: () => mockProducts_service.getTopStores(),
  getStore: (id: string) => mockProducts_service.getStore(id),
  getReviews: (productId: string) => mockProducts_service.getReviews(productId),
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => mockProducts_service.addReview(review),
  getPriceHistory: (productId: string) => mockProducts_service.getPriceHistory(productId),
  getSellerProducts: (sellerId: string) => mockProducts_service.getSellerProducts(sellerId),
  getSellerMetrics: () => mockProducts_service.getSellerMetrics(),
  getAdminMetrics: () => mockProducts_service.getAdminMetrics(),
  getAdminUsers: () => mockProducts_service.getAdminUsers(),

  // ─── Pricing ─────────────────────────────────────────────────
  comparePrices: (productId: string) => mockPricing.comparePrices(productId),
  getLowestPrice: (productId: string) => mockPricing.getLowestPriceListing(productId),
  getPriceDrops: () => mockPricing.getPriceDrops(),

  // ─── AI ──────────────────────────────────────────────────────
  getAIRecommendation: (productId: string): Promise<AIRecommendation | null> => mockAI.getRecommendation(productId),
  getBestValue: (productId: string) => mockAI.getBestValue(productId),
  getPersonalizedRecommendations: (limit?: number) => mockAI.getPersonalizedRecommendations(limit),

  // ─── Orders ──────────────────────────────────────────────────
  getOrders: (userId?: string) => mockOrders.getOrders(userId),
  getOrder: (orderId: string) => mockOrders.getOrder(orderId),
  checkout: (items: CartItem[], address: DeliveryAddress, paymentMethod: string, userId: string): Promise<Order> =>
    mockOrders.checkout(items, address, paymentMethod, userId),
  cancelOrder: (orderId: string) => mockOrders.cancelOrder(orderId),
  getSellerOrders: (sellerId: string) => mockOrders.getSellerOrders(sellerId),
  getOrderStats: () => mockOrders.getOrderStats(),
};

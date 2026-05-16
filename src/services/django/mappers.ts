/**
 * services/django/mappers.ts
 * Centralized mapping logic to normalize snake_case Django responses
 * into camelCase TypeScript interfaces used by the frontend.
 */

import type { User, Product, Order, CartItem } from '@/types';

export const mappers = {
  /** Map Django User model to frontend User interface */
  user: (d: any): User => ({
    id: String(d.id),
    fullName: d.name || d.full_name || '',
    email: d.email || '',
    phone: d.phone || '',
    role: d.role || 'buyer',
    businessName: d.business_name || d.businessName,
    isVerified: !!(d.verified || d.is_verified || d.isVerified),
    isActive: !!(d.is_active || d.isActive),
    createdAt: d.created_at || d.date_joined || d.createdAt,
    addresses: d.addresses || [],
  }),

  /** Map Django Product model to frontend Product interface */
  product: (d: any): Product => ({
    id: String(d.id),
    name: d.name || '',
    description: d.description || '',
    category: d.category_name || (d.category && typeof d.category === 'object' ? d.category.name : d.category) || '',
    images: Array.isArray(d.images) ? d.images.map((img: any) => typeof img === 'string' ? img : img.image) : [],
    sku: d.SKU || d.sku || '',
    createdAt: d.created_at || d.createdAt,
  }),

  /** Map Django Order model to frontend Order interface */
  order: (d: any): Order => ({
    id: String(d.id),
    userId: d.buyer || d.userId,
    items: (d.items || []).map(mappers.cartItem),
    totalAmount: parseFloat(d.total_amount || d.totalAmount || 0),
    status: d.status || 'pending',
    deliveryAddress: d.shipping_address || d.deliveryAddress,
    paymentMethod: d.payment_method || d.paymentMethod || 'paystack',
    createdAt: d.created_at || d.createdAt,
  }),

  /** Map Django OrderItem/CartItem to frontend CartItem interface */
  cartItem: (d: any): CartItem => ({
    id: String(d.id),
    productId: d.product_id || (d.product && typeof d.product === 'object' ? d.product.id : d.product) || d.productId,
    listingId: d.listing_id || d.listingId || '',
    storeName: d.seller_name || d.storeName || '',
    productName: d.product_name || (d.product && typeof d.product === 'object' ? d.product.name : '') || d.productName,
    productImage: d.product_image || (d.product && typeof d.product === 'object' ? d.product.main_image : '') || d.productImage,
    price: parseFloat(d.unit_price || d.price || 0),
    quantity: d.quantity || 1,
    sellerId: d.seller_id || d.sellerId || '',
  }),
};

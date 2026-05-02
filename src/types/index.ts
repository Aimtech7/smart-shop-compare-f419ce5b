export type UserRole = 'buyer' | 'seller' | 'admin';

export interface DeliveryAddress {
  id: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  businessName?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  addresses?: DeliveryAddress[];
}

export interface SellerProfile {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  logo: string;
  rating: number;
  totalSales: number;
  commissionRate: number;
  isVerified: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  sku: string;
  createdAt: string;
}

export interface StoreListing {
  id: string;
  productId: string;
  sellerId: string;
  storeName: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sellerRating: number;
  isLowestPrice?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  listingId: string;
  storeName: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  sellerId: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  deliveryAddress: DeliveryAddress;
  paymentMethod: string;
  createdAt: string;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isVerifiedBuyer: boolean;
  createdAt: string;
  replies?: ReviewReply[];
}

export interface ReviewReply {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  listingId: string;
  price: number;
  recordedAt: string;
}

export interface SearchFilters {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

export interface AIRecommendation {
  productId: string;
  listingId: string;
  productName: string;
  storeName: string;
  price: number;
  rating: number;
  reason: string;
  score: number;
}

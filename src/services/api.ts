import type { Product, StoreListing, User, Review, Order, CartItem, SearchFilters, AIRecommendation, SellerProfile, PriceHistory } from '@/types';

// Mock data — expanded with products for ALL categories and real images
const mockProducts: (Product & { listings: StoreListing[] })[] = [
  // Electronics
  {
    id: '1', name: 'Samsung Galaxy S24 Ultra', description: 'Latest flagship smartphone with AI features', category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop'], sku: 'SAM-S24U-001', createdAt: '2024-01-15',
    listings: [
      { id: 'l1', productId: '1', sellerId: 's1', storeName: 'TechHub Store', price: 1199, originalPrice: 1399, stock: 25, sellerRating: 4.8, isLowestPrice: false },
      { id: 'l2', productId: '1', sellerId: 's2', storeName: 'MobileWorld', price: 1149, originalPrice: 1350, stock: 12, sellerRating: 4.5, isLowestPrice: true },
      { id: 'l3', productId: '1', sellerId: 's3', storeName: 'GadgetPro', price: 1249, stock: 8, sellerRating: 4.2 },
    ],
  },
  {
    id: '2', name: 'MacBook Pro 16" M3 Max', description: 'Professional laptop with M3 Max chip', category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=600&fit=crop'], sku: 'APL-MBP16-001', createdAt: '2024-02-01',
    listings: [
      { id: 'l4', productId: '2', sellerId: 's1', storeName: 'TechHub Store', price: 3499, stock: 5, sellerRating: 4.8 },
      { id: 'l5', productId: '2', sellerId: 's4', storeName: 'AppleZone', price: 3399, originalPrice: 3599, stock: 15, sellerRating: 4.9, isLowestPrice: true },
    ],
  },
  {
    id: '6', name: 'iPad Air M2', description: 'Versatile tablet for work and play', category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&h=600&fit=crop'], sku: 'APL-IPA-001', createdAt: '2024-03-10',
    listings: [
      { id: 'l13', productId: '6', sellerId: 's4', storeName: 'AppleZone', price: 599, stock: 22, sellerRating: 4.9, isLowestPrice: true },
      { id: 'l14', productId: '6', sellerId: 's1', storeName: 'TechHub Store', price: 629, stock: 15, sellerRating: 4.8 },
    ],
  },
  // Audio
  {
    id: '3', name: 'Sony WH-1000XM5', description: 'Premium noise-cancelling headphones', category: 'Audio',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop'], sku: 'SNY-WH5-001', createdAt: '2024-01-20',
    listings: [
      { id: 'l6', productId: '3', sellerId: 's2', storeName: 'MobileWorld', price: 348, stock: 30, sellerRating: 4.5 },
      { id: 'l7', productId: '3', sellerId: 's5', storeName: 'AudioKing', price: 329, originalPrice: 399, stock: 20, sellerRating: 4.7, isLowestPrice: true },
      { id: 'l8', productId: '3', sellerId: 's1', storeName: 'TechHub Store', price: 355, stock: 18, sellerRating: 4.8 },
    ],
  },
  {
    id: '10', name: 'JBL Charge 5 Speaker', description: 'Portable Bluetooth speaker with powerful bass', category: 'Audio',
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop'], sku: 'JBL-CH5-001', createdAt: '2024-03-20',
    listings: [
      { id: 'l22', productId: '10', sellerId: 's5', storeName: 'AudioKing', price: 149, originalPrice: 179, stock: 40, sellerRating: 4.7, isLowestPrice: true },
      { id: 'l23', productId: '10', sellerId: 's1', storeName: 'TechHub Store', price: 159, stock: 25, sellerRating: 4.8 },
    ],
  },
  // Fashion
  {
    id: '4', name: 'Nike Air Max 270', description: 'Comfortable lifestyle sneakers', category: 'Fashion',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop'], sku: 'NKE-AM270-001', createdAt: '2024-03-01',
    listings: [
      { id: 'l9', productId: '4', sellerId: 's6', storeName: 'SneakerSpot', price: 150, stock: 50, sellerRating: 4.6, isLowestPrice: true },
      { id: 'l10', productId: '4', sellerId: 's7', storeName: 'FashionHub', price: 165, originalPrice: 180, stock: 35, sellerRating: 4.3 },
    ],
  },
  {
    id: '11', name: 'Levi\'s 501 Original Jeans', description: 'Classic straight-leg denim jeans', category: 'Fashion',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop'], sku: 'LEV-501-001', createdAt: '2024-02-25',
    listings: [
      { id: 'l24', productId: '11', sellerId: 's7', storeName: 'FashionHub', price: 69, originalPrice: 89, stock: 60, sellerRating: 4.3, isLowestPrice: true },
      { id: 'l25', productId: '11', sellerId: 's6', storeName: 'SneakerSpot', price: 79, stock: 30, sellerRating: 4.6 },
    ],
  },
  {
    id: '12', name: 'Ray-Ban Aviator Sunglasses', description: 'Iconic metal frame sunglasses', category: 'Fashion',
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop'], sku: 'RB-AV-001', createdAt: '2024-03-05',
    listings: [
      { id: 'l26', productId: '12', sellerId: 's7', storeName: 'FashionHub', price: 154, stock: 20, sellerRating: 4.3, isLowestPrice: true },
    ],
  },
  // Home & Garden
  {
    id: '5', name: 'Dyson V15 Detect', description: 'Cordless vacuum with laser detection', category: 'Home & Garden',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop'], sku: 'DYS-V15-001', createdAt: '2024-02-15',
    listings: [
      { id: 'l11', productId: '5', sellerId: 's8', storeName: 'HomeEssentials', price: 749, originalPrice: 799, stock: 10, sellerRating: 4.4, isLowestPrice: true },
      { id: 'l12', productId: '5', sellerId: 's1', storeName: 'TechHub Store', price: 769, stock: 7, sellerRating: 4.8 },
    ],
  },
  {
    id: '13', name: 'Philips Hue Starter Kit', description: 'Smart LED light bulbs with hub', category: 'Home & Garden',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop'], sku: 'PHL-HUE-001', createdAt: '2024-01-28',
    listings: [
      { id: 'l27', productId: '13', sellerId: 's8', storeName: 'HomeEssentials', price: 129, originalPrice: 159, stock: 35, sellerRating: 4.4, isLowestPrice: true },
    ],
  },
  {
    id: '14', name: 'KitchenAid Stand Mixer', description: 'Professional-grade tilt-head stand mixer', category: 'Home & Garden',
    images: ['https://images.unsplash.com/photo-1594834749740-74b3f6764be4?w=600&h=600&fit=crop'], sku: 'KA-SM-001', createdAt: '2024-02-10',
    listings: [
      { id: 'l28', productId: '14', sellerId: 's8', storeName: 'HomeEssentials', price: 349, originalPrice: 429, stock: 15, sellerRating: 4.4, isLowestPrice: true },
      { id: 'l29', productId: '14', sellerId: 's1', storeName: 'TechHub Store', price: 379, stock: 8, sellerRating: 4.8 },
    ],
  },
  // Beauty
  {
    id: '15', name: 'Dyson Airwrap Complete', description: 'Multi-styler for multiple hair types', category: 'Beauty',
    images: ['https://images.unsplash.com/photo-1522338242992-e1a54f0e2ed4?w=600&h=600&fit=crop'], sku: 'DYS-AW-001', createdAt: '2024-01-10',
    listings: [
      { id: 'l30', productId: '15', sellerId: 's9', storeName: 'BeautyGlow', price: 499, originalPrice: 599, stock: 12, sellerRating: 4.6, isLowestPrice: true },
      { id: 'l31', productId: '15', sellerId: 's8', storeName: 'HomeEssentials', price: 549, stock: 8, sellerRating: 4.4 },
    ],
  },
  {
    id: '16', name: 'La Mer Moisturizing Cream', description: 'Luxury face moisturizer', category: 'Beauty',
    images: ['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop'], sku: 'LM-MC-001', createdAt: '2024-03-15',
    listings: [
      { id: 'l32', productId: '16', sellerId: 's9', storeName: 'BeautyGlow', price: 190, stock: 20, sellerRating: 4.6, isLowestPrice: true },
    ],
  },
  {
    id: '17', name: 'MAC Lipstick Ruby Woo', description: 'Iconic retro matte lipstick', category: 'Beauty',
    images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop'], sku: 'MAC-RW-001', createdAt: '2024-02-20',
    listings: [
      { id: 'l33', productId: '17', sellerId: 's9', storeName: 'BeautyGlow', price: 21, originalPrice: 25, stock: 100, sellerRating: 4.6, isLowestPrice: true },
    ],
  },
  // Sports
  {
    id: '18', name: 'Yoga Mat Premium', description: 'Non-slip extra thick exercise mat', category: 'Sports',
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop'], sku: 'YM-PM-001', createdAt: '2024-01-25',
    listings: [
      { id: 'l34', productId: '18', sellerId: 's10', storeName: 'FitZone', price: 45, originalPrice: 59, stock: 80, sellerRating: 4.5, isLowestPrice: true },
    ],
  },
  {
    id: '19', name: 'Garmin Forerunner 265', description: 'Advanced GPS running smartwatch', category: 'Sports',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'], sku: 'GAR-FR265-001', createdAt: '2024-03-08',
    listings: [
      { id: 'l35', productId: '19', sellerId: 's10', storeName: 'FitZone', price: 399, originalPrice: 449, stock: 18, sellerRating: 4.5, isLowestPrice: true },
      { id: 'l36', productId: '19', sellerId: 's1', storeName: 'TechHub Store', price: 429, stock: 10, sellerRating: 4.8 },
    ],
  },
  {
    id: '20', name: 'Adjustable Dumbbell Set', description: 'Space-saving adjustable weights 5-52 lbs', category: 'Sports',
    images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop'], sku: 'DB-ADJ-001', createdAt: '2024-02-05',
    listings: [
      { id: 'l37', productId: '20', sellerId: 's10', storeName: 'FitZone', price: 299, originalPrice: 349, stock: 25, sellerRating: 4.5, isLowestPrice: true },
    ],
  },
  // Toys & Games
  {
    id: '21', name: 'LEGO Star Wars Millennium Falcon', description: 'Ultimate collector series building set', category: 'Toys & Games',
    images: ['https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=600&h=600&fit=crop'], sku: 'LG-SW-MF-001', createdAt: '2024-01-18',
    listings: [
      { id: 'l38', productId: '21', sellerId: 's11', storeName: 'ToyLand', price: 799, originalPrice: 849, stock: 5, sellerRating: 4.7, isLowestPrice: true },
    ],
  },
  {
    id: '22', name: 'Nintendo Switch OLED', description: 'Handheld gaming console with OLED screen', category: 'Toys & Games',
    images: ['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&h=600&fit=crop'], sku: 'NIN-SW-OLED', createdAt: '2024-03-12',
    listings: [
      { id: 'l39', productId: '22', sellerId: 's11', storeName: 'ToyLand', price: 329, originalPrice: 349, stock: 30, sellerRating: 4.7, isLowestPrice: true },
      { id: 'l40', productId: '22', sellerId: 's1', storeName: 'TechHub Store', price: 345, stock: 20, sellerRating: 4.8 },
    ],
  },
  {
    id: '23', name: 'Board Game Collection', description: 'Family strategy board game set', category: 'Toys & Games',
    images: ['https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=600&h=600&fit=crop'], sku: 'BG-COL-001', createdAt: '2024-02-18',
    listings: [
      { id: 'l41', productId: '23', sellerId: 's11', storeName: 'ToyLand', price: 39, originalPrice: 49, stock: 50, sellerRating: 4.7, isLowestPrice: true },
    ],
  },
];

const mockStores: SellerProfile[] = [
  { id: 's1', userId: 'u1', businessName: 'TechHub Store', description: 'Your one-stop tech shop', logo: '', rating: 4.8, totalSales: 15420, commissionRate: 8, isVerified: true },
  { id: 's2', userId: 'u2', businessName: 'MobileWorld', description: 'Best mobile deals', logo: '', rating: 4.5, totalSales: 8930, commissionRate: 10, isVerified: true },
  { id: 's3', userId: 'u3', businessName: 'GadgetPro', description: 'Premium gadgets', logo: '', rating: 4.2, totalSales: 5600, commissionRate: 10, isVerified: false },
  { id: 's4', userId: 'u4', businessName: 'AppleZone', description: 'Authorized Apple reseller', logo: '', rating: 4.9, totalSales: 22100, commissionRate: 7, isVerified: true },
  { id: 's5', userId: 'u5', businessName: 'AudioKing', description: 'Premium audio equipment', logo: '', rating: 4.7, totalSales: 6700, commissionRate: 9, isVerified: true },
  { id: 's6', userId: 'u6', businessName: 'SneakerSpot', description: 'Authentic sneakers', logo: '', rating: 4.6, totalSales: 12300, commissionRate: 10, isVerified: true },
  { id: 's7', userId: 'u7', businessName: 'FashionHub', description: 'Trendy fashion', logo: '', rating: 4.3, totalSales: 9800, commissionRate: 12, isVerified: false },
  { id: 's8', userId: 'u8', businessName: 'HomeEssentials', description: 'Home & living', logo: '', rating: 4.4, totalSales: 7400, commissionRate: 10, isVerified: true },
  { id: 's9', userId: 'u9', businessName: 'BeautyGlow', description: 'Premium beauty products', logo: '', rating: 4.6, totalSales: 11200, commissionRate: 10, isVerified: true },
  { id: 's10', userId: 'u10', businessName: 'FitZone', description: 'Sports & fitness gear', logo: '', rating: 4.5, totalSales: 8900, commissionRate: 10, isVerified: true },
  { id: 's11', userId: 'u11', businessName: 'ToyLand', description: 'Toys & games for all ages', logo: '', rating: 4.7, totalSales: 10500, commissionRate: 10, isVerified: true },
];

const mockReviews: Review[] = [
  { id: 'r1', productId: '1', userId: 'u10', userName: 'John D.', rating: 5, comment: 'Amazing phone! The AI features are incredible.', isVerifiedBuyer: true, createdAt: '2024-03-01' },
  { id: 'r2', productId: '1', userId: 'u11', userName: 'Sarah M.', rating: 4, comment: 'Great camera but battery could be better.', isVerifiedBuyer: true, createdAt: '2024-02-28' },
  { id: 'r3', productId: '2', userId: 'u12', userName: 'Alex K.', rating: 5, comment: 'Best laptop I have ever used. Period.', isVerifiedBuyer: true, createdAt: '2024-03-05' },
  { id: 'r4', productId: '3', userId: 'u13', userName: 'Emily R.', rating: 4, comment: 'Excellent noise cancellation, very comfortable.', isVerifiedBuyer: false, createdAt: '2024-02-20' },
];

const mockPriceHistory: PriceHistory[] = [
  { id: 'ph1', productId: '1', listingId: 'l2', price: 1299, recordedAt: '2024-01-01' },
  { id: 'ph2', productId: '1', listingId: 'l2', price: 1249, recordedAt: '2024-01-15' },
  { id: 'ph3', productId: '1', listingId: 'l2', price: 1199, recordedAt: '2024-02-01' },
  { id: 'ph4', productId: '1', listingId: 'l2', price: 1179, recordedAt: '2024-02-15' },
  { id: 'ph5', productId: '1', listingId: 'l2', price: 1149, recordedAt: '2024-03-01' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  async getProducts(filters?: SearchFilters): Promise<(Product & { listings: StoreListing[] })[]> {
    await delay(300);
    let results = [...mockProducts];
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (filters?.category) results = results.filter(p => p.category === filters.category);
    if (filters?.minPrice) results = results.filter(p => p.listings.some(l => l.price >= filters.minPrice!));
    if (filters?.maxPrice) results = results.filter(p => p.listings.some(l => l.price <= filters.maxPrice!));
    if (filters?.sortBy === 'price_asc') results.sort((a, b) => Math.min(...a.listings.map(l => l.price)) - Math.min(...b.listings.map(l => l.price)));
    if (filters?.sortBy === 'price_desc') results.sort((a, b) => Math.min(...b.listings.map(l => l.price)) - Math.min(...a.listings.map(l => l.price)));
    return results;
  },

  async getProduct(id: string) {
    await delay(200);
    return mockProducts.find(p => p.id === id) || null;
  },

  async getStores() { await delay(200); return mockStores; },
  async getTopStores() { await delay(200); return mockStores.filter(s => s.rating >= 4.5).slice(0, 4); },

  async getReviews(productId: string) { await delay(200); return mockReviews.filter(r => r.productId === productId); },
  async getPriceHistory(productId: string) { await delay(200); return mockPriceHistory.filter(h => h.productId === productId); },

  async getAIRecommendation(productId: string): Promise<AIRecommendation | null> {
    await delay(800);
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return null;
    const best = product.listings.reduce((a, b) => {
      const scoreA = (5 - a.price / 1000) + a.sellerRating + (a.stock > 10 ? 1 : 0);
      const scoreB = (5 - b.price / 1000) + b.sellerRating + (b.stock > 10 ? 1 : 0);
      return scoreA > scoreB ? a : b;
    });
    return {
      productId, listingId: best.id, productName: product.name, storeName: best.storeName,
      price: best.price, rating: best.sellerRating, score: 92,
      reason: `Best combination of competitive pricing ($${best.price}), high seller rating (${best.sellerRating}★), and good stock availability.`,
    };
  },

  // Admin
  async getAdminMetrics() {
    await delay(300);
    return { totalUsers: 24580, totalProducts: 1847, totalOrders: 12340, totalRevenue: 2456789, activeStores: mockStores.length, pendingReviews: 23 };
  },

  async getAdminUsers(): Promise<User[]> {
    await delay(300);
    return [
      { id: 'u1', fullName: 'John Smith', email: 'john@example.com', phone: '+1234567890', role: 'buyer' as const, isVerified: true, isActive: true, createdAt: '2024-01-01' },
      { id: 'u2', fullName: 'Jane Doe', email: 'jane@example.com', phone: '+1234567891', role: 'seller' as const, isVerified: true, isActive: true, createdAt: '2024-01-05' },
      { id: 'u3', fullName: 'Bob Wilson', email: 'bob@example.com', phone: '+1234567892', role: 'buyer' as const, isVerified: false, isActive: false, createdAt: '2024-02-01' },
    ];
  },

  async getSellerProducts(_sellerId: string) {
    await delay(300);
    return mockProducts.slice(0, 3);
  },

  async getSellerMetrics() {
    await delay(300);
    return { totalProducts: 45, totalOrders: 234, revenue: 45670, pendingOrders: 12 };
  },
};

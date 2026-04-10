import { create } from 'zustand';
import type { User, CartItem } from '@/types';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartByStore: () => Record<string, CartItem[]>;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false, cart: [] }),

  cart: [],
  addToCart: (item) => {
    const existing = get().cart.find(c => c.listingId === item.listingId);
    if (existing) {
      set({ cart: get().cart.map(c => c.listingId === item.listingId ? { ...c, quantity: c.quantity + 1 } : c) });
    } else {
      set({ cart: [...get().cart, { ...item, id: `cart-${Date.now()}` }] });
    }
  },
  removeFromCart: (id) => set({ cart: get().cart.filter(c => c.id !== id) }),
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) { set({ cart: get().cart.filter(c => c.id !== id) }); return; }
    set({ cart: get().cart.map(c => c.id === id ? { ...c, quantity } : c) });
  },
  clearCart: () => set({ cart: [] }),
  getCartTotal: () => get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
  getCartByStore: () => {
    const grouped: Record<string, CartItem[]> = {};
    get().cart.forEach(item => {
      if (!grouped[item.storeName]) grouped[item.storeName] = [];
      grouped[item.storeName].push(item);
    });
    return grouped;
  },

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));

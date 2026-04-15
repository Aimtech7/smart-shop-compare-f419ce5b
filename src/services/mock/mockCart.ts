import type { CartItem, Order, DeliveryAddress } from '@/types';

const CART_KEY = 'tha_buyer_cart';

export const mockCart = {
  getCart(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveCart(items: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  },

  clearCart(): void {
    localStorage.removeItem(CART_KEY);
  },

  async checkout(items: CartItem[], address: DeliveryAddress, paymentMethod: string): Promise<Order> {
    await new Promise(r => setTimeout(r, 800));
    const order: Order = {
      id: `order-${Date.now()}`,
      userId: 'current-user',
      items,
      totalAmount: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      status: 'pending',
      deliveryAddress: address,
      paymentMethod,
      createdAt: new Date().toISOString(),
    };
    localStorage.removeItem(CART_KEY);
    return order;
  },
};

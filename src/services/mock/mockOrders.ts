import type { CartItem, Order, DeliveryAddress } from '@/types';
import { withSimulation } from './simulation';

const ORDERS_KEY = 'tha_buyer_orders';
const CART_KEY = 'tha_buyer_cart';

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : getDefaultOrders();
  } catch {
    return getDefaultOrders();
  }
}

function saveOrders(orders: Order[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function getDefaultOrders(): Order[] {
  return [
    {
      id: 'ORD-001', userId: 'u-buyer-1',
      items: [{ id: 'ci1', productId: '1', listingId: 'l2', storeName: 'MobileWorld', productName: 'Samsung Galaxy S24 Ultra', productImage: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600', price: 1149, quantity: 1, sellerId: 's2' }],
      totalAmount: 1149, status: 'delivered',
      deliveryAddress: { fullName: 'Demo Buyer', phone: '+19524861934', street: '123 Main St', city: 'Minneapolis', state: 'MN', zipCode: '55401', country: 'US' },
      paymentMethod: 'card', createdAt: '2024-03-15T10:00:00Z',
    },
    {
      id: 'ORD-002', userId: 'u-buyer-1',
      items: [{ id: 'ci2', productId: '3', listingId: 'l7', storeName: 'AudioKing', productName: 'Sony WH-1000XM5', productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', price: 329, quantity: 1, sellerId: 's5' }],
      totalAmount: 329, status: 'shipped',
      deliveryAddress: { fullName: 'Demo Buyer', phone: '+19524861934', street: '123 Main St', city: 'Minneapolis', state: 'MN', zipCode: '55401', country: 'US' },
      paymentMethod: 'mobile_money', createdAt: '2024-03-20T14:00:00Z',
    },
    {
      id: 'ORD-003', userId: 'u-buyer-1',
      items: [{ id: 'ci3', productId: '5', listingId: 'l11', storeName: 'HomeEssentials', productName: 'Dyson V15 Detect', productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600', price: 749, quantity: 1, sellerId: 's8' }],
      totalAmount: 749, status: 'pending',
      deliveryAddress: { fullName: 'Demo Buyer', phone: '+19524861934', street: '123 Main St', city: 'Minneapolis', state: 'MN', zipCode: '55401', country: 'US' },
      paymentMethod: 'card', createdAt: '2024-03-25T09:00:00Z',
    },
  ];
}

export const mockOrders = {
  async getOrders(userId?: string) {
    return withSimulation(() => {
      const orders = loadOrders();
      return userId ? orders.filter(o => o.userId === userId) : orders;
    });
  },

  async getOrder(orderId: string) {
    return withSimulation(() => {
      const orders = loadOrders();
      return orders.find(o => o.id === orderId) || null;
    });
  },

  async checkout(items: CartItem[], address: DeliveryAddress, paymentMethod: string, userId: string): Promise<Order> {
    return withSimulation(() => {
      const order: Order = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        userId,
        items,
        totalAmount: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        status: 'pending',
        deliveryAddress: address,
        paymentMethod,
        createdAt: new Date().toISOString(),
      };
      const orders = loadOrders();
      orders.unshift(order);
      saveOrders(orders);
      localStorage.removeItem(CART_KEY);
      return order;
    }, { delayMs: 1000 });
  },

  async cancelOrder(orderId: string) {
    return withSimulation(() => {
      const orders = loadOrders();
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error('Order not found');
      if (order.status !== 'pending') throw new Error('Only pending orders can be cancelled');
      order.status = 'cancelled';
      saveOrders(orders);
      return order;
    });
  },

  /** Get seller orders (for seller dashboard) */
  async getSellerOrders(sellerId: string) {
    return withSimulation(() => {
      const orders = loadOrders();
      return orders.filter(o => o.items.some(i => i.sellerId === sellerId));
    });
  },

  /** Get order count by status */
  async getOrderStats() {
    return withSimulation(() => {
      const orders = loadOrders();
      return {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
      };
    });
  },
};

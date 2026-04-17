import { http } from './client';
import type { Order, DeliveryAddress } from '@/types';

export interface CheckoutPayload {
  address: DeliveryAddress;
  payment_method: 'stripe' | 'cod' | string;
}

export interface CheckoutResponse {
  order: Order;
  /** Stripe PaymentIntent client secret, if payment_method=stripe */
  client_secret?: string;
  payment_intent_id?: string;
}

export const djangoOrders = {
  list: () => http.get<Order[]>('/orders/'),
  get: (id: string) => http.get<Order>(`/orders/${id}/`),
  checkout: (payload: CheckoutPayload) =>
    http.post<CheckoutResponse>('/orders/checkout/', payload),
  cancel: (id: string) => http.post<Order>(`/orders/${id}/cancel/`),
};

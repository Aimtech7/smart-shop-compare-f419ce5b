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
  checkout: (payload: CheckoutPayload) => {
    const addressStr = `${payload.address.street1 || (payload.address as any).street}, ${payload.address.city}, ${payload.address.state} ${payload.address.zip_code || (payload.address as any).zipCode} ${payload.address.country}`;
    return http.post<CheckoutResponse>('/orders/checkout/', {
      shipping_address: addressStr,
      address_details: payload.address, // send full details to save user address
      payment_ref: payload.payment_method
    });
  },
  cancel: (id: string) => http.post<Order>(`/orders/${id}/cancel/`),
};

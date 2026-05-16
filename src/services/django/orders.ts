import { http } from './client';
import { mappers } from './mappers';
import type { Order, DeliveryAddress } from '@/types';

export interface CheckoutPayload {
  address: DeliveryAddress;
  payment_method: 'paystack' | 'cod' | string;
}

export interface CheckoutResponse {
  order: Order;
  /** Paystack Reference, if payment_method=paystack */
  client_secret?: string;
  payment_intent_id?: string;
}

export const djangoOrders = {
  list: async () => {
    const res = await http.get<any[]>('/orders/');
    return res.map(mappers.order);
  },
  get: async (id: string) => {
    const res = await http.get<any>(`/orders/${id}/`);
    return mappers.order(res);
  },
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

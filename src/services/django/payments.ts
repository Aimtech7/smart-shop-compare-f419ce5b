import { http } from './client';

export const djangoPayments = {
  createCheckoutSession: async (cart: any, totalAmount: number) => {
    return http.post<{ status: string; message: string; checkout_url: string }>('/payments/create-checkout-session/', { cart, total_amount: totalAmount });
  },
};

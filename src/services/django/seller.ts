import { http } from './client';
import type { Product, Order } from '@/types';

export interface SellerDashboard {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  revenue: number;
}

export const djangoSeller = {
  dashboard: () => http.get<SellerDashboard>('/seller/dashboard/'),
  products: () => http.get<Product[]>('/seller/products/'),
  createProduct: (payload: Partial<Product> & { price: number; stock: number } | FormData) =>
    http.post<Product>('/products/', payload),
  updateProduct: (id: string, payload: Partial<Product> | FormData) =>
    http.patch<Product>(`/products/${id}/`, payload),
  deleteProduct: (id: string) => http.delete<void>(`/products/${id}/`),
  orders: () => http.get<Order[]>('/seller/orders/'),
};

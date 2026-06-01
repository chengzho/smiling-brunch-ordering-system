import { apiRequest } from './apiRequest';
import type { Order, OrderDetail } from '../types/order';

export function apiCreateOrder(): Promise<{ order_id: number; total_amount: number }> {
  return apiRequest('/orders/create.php', { method: 'POST' });
}

export type OrdersScope = 'active' | 'history';

export function apiGetMyOrders(scope?: OrdersScope): Promise<Order[]> {
  const qs = scope ? `?scope=${scope}` : '';
  return apiRequest<Order[]>(`/orders/my_orders.php${qs}`);
}

export function apiGetOrderDetail(orderId: number): Promise<OrderDetail> {
  return apiRequest<OrderDetail>(`/orders/detail.php?id=${orderId}`);
}

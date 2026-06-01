import { apiRequest } from './apiRequest';
import type { Order } from '../types/order';
import type { User } from '../types/user';
import type { Category } from '../types/menu';

export type TopProduct = {
  item_name: string;
  total_qty: number;
  total_revenue: number;
};

export type TopCustomer = {
  customer_name: string;
  order_count: number;
  total_spent: number;
};

export type DashboardStats = {
  customer_count: number;
  available_menu_count: number;
  order_count: number;
  completed_sales: number;
  pending_order_count: number;
  preparing_order_count: number;
  top_products: TopProduct[];
  top_customers: TopCustomer[];
};

export function apiGetDashboardStats(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>('/admin/dashboard.php');
}

export function apiAdminGetOrders(): Promise<Order[]> {
  return apiRequest<Order[]>('/admin/orders/list.php');
}

export function apiAdminUpdateOrderStatus(
  orderId: number,
  orderStatus: string
): Promise<null> {
  return apiRequest<null>('/admin/orders/update_status.php', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId, order_status: orderStatus }),
  });
}

export function apiAdminGetUsers(): Promise<User[]> {
  return apiRequest<User[]>('/admin/users/list.php');
}

export function apiAdminUpdateUserStatus(
  userId: number,
  status: string
): Promise<null> {
  return apiRequest<null>('/admin/users/update_status.php', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, status }),
  });
}

export type CreateAdminInput = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirm: string;
};

export function apiAdminCreateAdmin(data: CreateAdminInput): Promise<User> {
  return apiRequest<User>('/admin/users/create_admin.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function apiAdminGetCategories(): Promise<Category[]> {
  return apiRequest<Category[]>('/admin/categories/list.php');
}

export function apiAdminCreateCategory(data: {
  category_name: string;
  description: string;
}): Promise<{ category_id: number }> {
  return apiRequest('/admin/categories/create.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function apiAdminUpdateCategory(data: {
  category_id: number;
  category_name: string;
  description: string;
}): Promise<null> {
  return apiRequest<null>('/admin/categories/update.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function apiAdminDeleteCategory(categoryId: number): Promise<null> {
  return apiRequest<null>('/admin/categories/delete.php', {
    method: 'POST',
    body: JSON.stringify({ category_id: categoryId }),
  });
}

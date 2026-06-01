import { apiRequest } from './apiRequest';
import type { MenuItem, Category } from '../types/menu';

export function apiGetMenuItems(
  categoryId?: number | null,
  keyword?: string
): Promise<MenuItem[]> {
  const params = new URLSearchParams();
  if (categoryId) params.set('category_id', String(categoryId));
  if (keyword && keyword.trim()) params.set('keyword', keyword.trim());
  const qs = params.size > 0 ? `?${params.toString()}` : '';
  return apiRequest<MenuItem[]>(`/menu/list.php${qs}`);
}

export function apiGetCategories(): Promise<Category[]> {
  return apiRequest<Category[]>('/menu/categories.php');
}

export function apiAdminGetMenuItems(): Promise<MenuItem[]> {
  return apiRequest<MenuItem[]>('/admin/menu/list.php');
}

export function apiAdminCreateMenuItem(data: {
  category_id: number;
  item_name: string;
  description: string;
  price: number;
  image_url: string;
}): Promise<{ item_id: number }> {
  return apiRequest('/admin/menu/create.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function apiAdminUpdateMenuItem(data: {
  item_id: number;
  category_id: number;
  item_name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: number;
}): Promise<null> {
  return apiRequest('/admin/menu/update.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function apiAdminSetMenuItemUnavailable(itemId: number): Promise<null> {
  return apiRequest('/admin/menu/set_unavailable.php', {
    method: 'POST',
    body: JSON.stringify({ item_id: itemId }),
  });
}

import { apiRequest } from './apiRequest';
import type { Cart } from '../types/cart';

export function apiGetCart(): Promise<Cart> {
  return apiRequest<Cart>('/cart/list.php');
}

export function apiAddToCart(itemId: number, quantity: number): Promise<null> {
  return apiRequest<null>('/cart/add.php', {
    method: 'POST',
    body: JSON.stringify({ item_id: itemId, quantity }),
  });
}

export function apiUpdateCartItem(cartItemId: number, quantity: number): Promise<null> {
  return apiRequest<null>('/cart/update.php', {
    method: 'POST',
    body: JSON.stringify({ cart_item_id: cartItemId, quantity }),
  });
}

export function apiRemoveCartItem(cartItemId: number): Promise<null> {
  return apiRequest<null>('/cart/remove.php', {
    method: 'POST',
    body: JSON.stringify({ cart_item_id: cartItemId }),
  });
}

export function apiClearCart(): Promise<null> {
  return apiRequest<null>('/cart/clear.php', { method: 'POST' });
}

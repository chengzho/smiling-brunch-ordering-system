import type { CartItem } from '../../types/cart';
import { formatCurrency } from '../../utils/formatCurrency';

type CartItemRowProps = {
  item: CartItem;
  onUpdateQuantity: (cartItemId: number, quantity: number) => void;
  onRemove: (cartItemId: number) => void;
};

export function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  return (
    <div className="cart-item-row">
      <div className="cart-item-info">
        <p className="cart-item-name">{item.item_name}</p>
      </div>
      <div className="cart-item-qty">
        <button
          className="qty-btn"
          onClick={() => onUpdateQuantity(item.cart_item_id, item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          −
        </button>
        <span className="qty-value">{item.quantity}</span>
        <button
          className="qty-btn"
          onClick={() => onUpdateQuantity(item.cart_item_id, item.quantity + 1)}
        >
          ＋
        </button>
      </div>
      <div className="cart-item-subtotal-wrap">
        <span className="cart-item-subtotal-label">小計</span>
        <span className="cart-item-subtotal">{formatCurrency(item.subtotal)}</span>
      </div>
      <button
        className="btn btn-outline btn-sm cart-item-remove"
        onClick={() => onRemove(item.cart_item_id)}
      >
        移除
      </button>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGetCart, apiUpdateCartItem, apiRemoveCartItem, apiClearCart, apiAddToCart } from '../api/cartApi';
import { apiCreateOrder } from '../api/orderApi';
import { formatCurrency } from '../utils/formatCurrency';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { CartItemRow } from '../components/cart/CartItemRow';
import { CartEmptyState } from '../components/cart/CartEmptyState';
import { Toast } from '../components/common/Toast';
import type { Cart } from '../types/cart';

export function CartPage() {
  const navigate = useNavigate();
  const { refreshCartCount, clearCartCount } = useCart();
  const { toast, showToast, hideToast } = useToast();
  const [cart, setCart]           = useState<Cart | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  const loadCart = useCallback(() => {
    setLoading(true);
    apiGetCart()
      .then(setCart)
      .catch((err) => setError(err instanceof Error ? err.message : '載入購物車失敗'))
      .finally(() => setLoading(false));
  }, []);

  // Silent reload used after add-to-cart to avoid spinner flash
  const reloadCart = useCallback(() => {
    apiGetCart().then(setCart).catch(() => {});
  }, []);

  useEffect(() => { loadCart(); }, [loadCart]);

  const handleAddToCart = useCallback(async (itemId: number): Promise<void> => {
    try {
      await apiAddToCart(itemId, 1);
      showToast('已加入購物車', 'success');
      void refreshCartCount();
      reloadCart();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '加入購物車失敗', 'error');
    }
  }, [showToast, refreshCartCount, reloadCart]);

  const handleQuantityChange = async (cartItemId: number, newQty: number) => {
    await apiUpdateCartItem(cartItemId, newQty).catch(() => {});
    loadCart();
    void refreshCartCount();
  };

  const handleRemove = async (cartItemId: number) => {
    await apiRemoveCartItem(cartItemId).catch(() => {});
    loadCart();
    void refreshCartCount();
  };

  const handleClear = async () => {
    await apiClearCart().catch(() => {});
    clearCartCount();
    loadCart();
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    setError('');
    try {
      await apiCreateOrder();
      clearCartCount();
      navigate('/orders?created=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : '結帳失敗，請稍後再試');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content cart-page-content">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>載入中...</span>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="page-content cart-page-content">
      <h1 className="page-title">購物車</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {isEmpty ? (
        <CartEmptyState onAddToCart={handleAddToCart} />
      ) : (
        <div className="cart-layout">
          <div className="cart-left">
            <div className="cart-section">
              <div className="cart-section-header">
                <span className="cart-section-title">餐點清單（{cart.items.length} 項）</span>
                <button className="btn btn-outline btn-sm" onClick={handleClear}>
                  清空購物車
                </button>
              </div>
              <div className="cart-items-list">
                {cart.items.map((item) => (
                  <CartItemRow
                    key={item.cart_item_id}
                    item={item}
                    onUpdateQuantity={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="cart-right">
            <div className="cart-section">
              <div className="cart-summary">
                <p className="cart-summary-title">訂單摘要</p>
                {cart.items.map((item) => (
                  <div key={item.cart_item_id} className="cart-summary-row">
                    <span>{item.item_name} × {item.quantity}</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
                <hr className="cart-summary-divider" />
                <div className="cart-summary-row">
                  <span>付款方式</span>
                  <span className="cart-summary-payment-value">現場付款</span>
                </div>
                <div className="cart-summary-row cart-summary-total">
                  <span>總計</span>
                  <span>{formatCurrency(cart.total_amount)}</span>
                </div>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 8 }}
                  disabled={checkingOut}
                  onClick={handleCheckout}
                >
                  {checkingOut ? '送出中...' : '送出訂單'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}

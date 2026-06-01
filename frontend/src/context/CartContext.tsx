import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apiGetCart } from '../api/cartApi';

type CartContextValue = {
  cartCount: number;
  refreshCartCount: () => Promise<void>;
  clearCartCount: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  // Re-fetch whenever the logged-in user changes
  useEffect(() => {
    if (!user || user.role !== 'customer') {
      setCartCount(0);
      return;
    }
    apiGetCart()
      .then((cart) => {
        const total = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
      })
      .catch(() => {});
  }, [user]);

  const refreshCartCount = useCallback(async () => {
    if (!user || user.role !== 'customer') return;
    try {
      const cart = await apiGetCart();
      const total = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    } catch {
      // keep current count on transient error
    }
  }, [user]);

  const clearCartCount = useCallback(() => setCartCount(0), []);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount, clearCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

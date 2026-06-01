import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGetMenuItems } from '../api/menuApi';
import { apiAddToCart } from '../api/cartApi';
import { MenuCard } from '../components/menu/MenuCard';
import { ProductDetailModal } from '../components/menu/ProductDetailModal';
import { Toast } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { useCart } from '../hooks/useCart';
import type { MenuItem } from '../types/menu';

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const { refreshCartCount } = useCart();
  const [featured, setFeatured]         = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    apiGetMenuItems().then((items) => {
      const FEATURED_NAMES = ['總匯吐司', '黃金脆薯', '香草雞腿排餐'];
      const ordered = FEATURED_NAMES
        .map((name) => items.find((item) => item.item_name === name))
        .filter((item): item is MenuItem => item !== undefined);
      setFeatured(ordered.length > 0 ? ordered : items.slice(0, 3));
    }).catch(() => {});
  }, []);

  const handleAddToCart = async (itemId: number): Promise<void> => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await apiAddToCart(itemId, 1);
      showToast('已加入購物車', 'success');
      void refreshCartCount();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '加入購物車失敗', 'error');
      throw err;
    }
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero-section">
        <h1 className="hero-title">Smiling Brunch</h1>
        <p className="hero-sub">線上菜單與訂餐管理系統</p>
        <div className="hero-actions">
          <Link to="/menu" className="btn btn-primary hero-cta">
            查看菜單
          </Link>
          {!user && (
            <Link to="/register" className="btn btn-outline hero-cta">
              立即註冊
            </Link>
          )}
        </div>
      </section>

      {/* Featured items */}
      {featured.length > 0 && (
        <section className="home-section">
          <h2 className="home-section-title">精選餐點</h2>
          <div className="home-featured-grid">
            {featured.map((item) => (
              <MenuCard
                key={item.item_id}
                item={item}
                onAddToCart={handleAddToCart}
                onOpen={() => setSelectedItem(item)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Info strip */}
      <div className="info-strip">
        <span>週一至週日 07:00 – 15:00</span>
        <span className="info-strip-dot">·</span>
        <span>外帶 · 內用</span>
        <span className="info-strip-dot">·</span>
        <span>線上訂餐免等候</span>
      </div>

      {selectedItem && (
        <ProductDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}
      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}

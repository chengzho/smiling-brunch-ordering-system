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
      const FEATURED_NAMES = ['總匯吐司', '黃金脆薯', '香草雞腿排餐', '里肌蛋吐司', '燻雞蛋餅', '蘿蔔糕'];
      const ordered = FEATURED_NAMES
        .map((name) => items.find((item) => item.item_name === name))
        .filter((item): item is MenuItem => item !== undefined);
      setFeatured(ordered);
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
      {/* Hero banner */}
      <section className="hero-banner">
        <div className="hero-banner-inner">
          <div className="hero-banner-left">
            <div className="hero-banner-copy">
              <h1 className="hero-banner-title">Smiling Brunch</h1>
              <p className="hero-banner-sub">線上菜單與訂餐管理系統</p>
              <div className="hero-banner-actions">
                <Link to="/menu" className="hero-banner-cta-primary">了解更多</Link>
                {!user && (
                  <Link to="/register" className="hero-banner-cta-secondary">註冊帳號</Link>
                )}
              </div>
            </div>
          </div>
          <div className="hero-banner-right">
            <div className="hero-icon-group">
              <div className="hero-icon-item">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 8h1a4 4 0 010 8h-1"/>
                  <path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z"/>
                  <line x1="6" y1="2" x2="6" y2="4"/>
                  <line x1="10" y1="2" x2="10" y2="4"/>
                  <line x1="14" y1="2" x2="14" y2="4"/>
                </svg>
              </div>
              <div className="hero-icon-item">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/>
                  <path d="M7 2v20"/>
                  <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3"/>
                  <path d="M21 15v7"/>
                </svg>
              </div>
              <div className="hero-icon-item">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 14A9 9 0 0 1 21 14"/>
                  <line x1="1" y1="16" x2="23" y2="16"/>
                  <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured items */}
      {featured.length > 0 && (
        <section className="home-featured-section">
          <div className="home-featured-inner">
            <h2 className="home-section-title home-featured-title">精選餐點，人氣早午餐推薦</h2>
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
            <div className="home-featured-cta">
              <Link to="/menu" className="home-featured-link">查看完整菜單 →</Link>
            </div>
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

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGetMenuItems, apiGetCategories } from '../api/menuApi';
import { apiAddToCart } from '../api/cartApi';
import { MenuCard } from '../components/menu/MenuCard';
import { ProductDetailModal } from '../components/menu/ProductDetailModal';
import { Toast } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { useCart } from '../hooks/useCart';
import type { MenuItem, Category } from '../types/menu';

export function MenuPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const { refreshCartCount } = useCart();

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems]           = useState<MenuItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [keyword, setKeyword]       = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    apiGetCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [keyword]);

  useEffect(() => {
    setLoading(true);
    setError('');
    apiGetMenuItems(selectedCategoryId, debouncedKeyword)
      .then(setItems)
      .catch(() => setError('載入菜單失敗，請稍後再試'))
      .finally(() => setLoading(false));
  }, [selectedCategoryId, debouncedKeyword]);

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
    <div className="menu-page">
      <div className="menu-content">
        <div className="menu-header-row">
          <h1 className="menu-page-title">菜單</h1>
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="搜尋餐點..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        <div className="category-tabs">
          <button
            className={`category-tab${selectedCategoryId === null ? ' active' : ''}`}
            onClick={() => setSelectedCategoryId(null)}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat.category_id}
              className={`category-tab${selectedCategoryId === cat.category_id ? ' active' : ''}`}
              onClick={() => setSelectedCategoryId(cat.category_id)}
            >
              {cat.category_name}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <span>載入中...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-text">
              {debouncedKeyword ? `找不到「${debouncedKeyword}」相關餐點` : '目前沒有餐點'}
            </p>
          </div>
        ) : (
          <div className="menu-grid">
            {items.map((item) => (
              <MenuCard
                key={item.item_id}
                item={item}
                onAddToCart={handleAddToCart}
                onOpen={() => setSelectedItem(item)}
              />
            ))}
          </div>
        )}
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

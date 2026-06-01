import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGetMenuItems } from '../../api/menuApi';
import { formatCurrency } from '../../utils/formatCurrency';
import type { MenuItem } from '../../types/menu';

type CartEmptyStateProps = {
  onAddToCart: (itemId: number) => Promise<void>;
};

const FEATURED_NAMES = ['總匯吐司', '黃金脆薯', '香草雞腿排餐'];

export function CartEmptyState({ onAddToCart }: CartEmptyStateProps) {
  const navigate = useNavigate();
  const [recs, setRecs] = useState<MenuItem[]>([]);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    apiGetMenuItems().then((items) => {
      const ordered = FEATURED_NAMES
        .map((name) => items.find((i) => i.item_name === name))
        .filter((i): i is MenuItem => i !== undefined);
      setRecs(ordered.length > 0 ? ordered : items.slice(0, 3));
    }).catch(() => {});
  }, []);

  const handleAdd = async (itemId: number) => {
    if (addingId !== null) return;
    setAddingId(itemId);
    try {
      await onAddToCart(itemId);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="cart-empty-card">
      <div className="cart-empty-main">
        <div className="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
        <p className="empty-state-title">購物車現在是空的</p>
        <p className="empty-state-desc">
          {'你還沒有加入任何餐點。\n一起看看菜單選擇喜歡的餐點吧，加入購物車後即可送出訂單！'}
        </p>
        <button className="btn btn-primary empty-state-cta" onClick={() => navigate('/menu')}>
          前往菜單
        </button>
      </div>

      {recs.length > 0 && (
        <div className="cart-empty-recs">
          <p className="cart-empty-recs-title">人氣推薦</p>
          <div className="cart-empty-recs-grid">
            {recs.map((item) => (
              <div key={item.item_id} className="cart-rec-card">
                <div className="cart-rec-img">
                  <img
                    src={item.image_url}
                    alt={item.item_name}
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <div className="cart-rec-body">
                  <p className="cart-rec-name">{item.item_name}</p>
                  <p className="cart-rec-price">{formatCurrency(item.price)}</p>
                  <button
                    className="cart-rec-add-btn"
                    disabled={addingId !== null}
                    onClick={() => void handleAdd(item.item_id)}
                  >
                    {addingId === item.item_id ? '加入中...' : '加入購物車'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import type { MenuItem } from '../../types/menu';
import { formatCurrency } from '../../utils/formatCurrency';
import { resolveAssetUrl } from '../../utils/assetPath';

type MenuCardProps = {
  item: MenuItem;
  onAddToCart: (itemId: number) => Promise<void>;
  onOpen?: () => void;
};

export function MenuCard({ item, onAddToCart, onOpen }: MenuCardProps) {
  const [adding,   setAdding]   = useState(false);
  const [added,    setAdded]    = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await onAddToCart(item.item_id);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch {
      // error surfaced by parent's onAddToCart
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="menu-card card" onClick={onOpen}>
      <div className="menu-card-img">
        {!imgError ? (
          <img
            src={resolveAssetUrl(item.image_url)}
            alt={item.item_name}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="img-fallback-text">無圖片</span>
        )}
      </div>
      <div className="menu-card-body">
        {item.category_name && (
          <span className="menu-card-category">{item.category_name}</span>
        )}
        <h3 className="menu-card-name">{item.item_name}</h3>
        <div className="menu-card-footer">
          <span className="menu-card-price">{formatCurrency(item.price)}</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => { e.stopPropagation(); void handleAdd(); }}
            disabled={adding || added}
          >
            {adding ? '加入中...' : added ? '已加入' : '加入購物車'}
          </button>
        </div>
      </div>
    </div>
  );
}

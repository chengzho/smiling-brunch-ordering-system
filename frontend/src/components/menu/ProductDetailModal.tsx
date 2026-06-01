import { useState, useEffect } from 'react';
import type { MenuItem } from '../../types/menu';
import { formatCurrency } from '../../utils/formatCurrency';
import { resolveAssetUrl } from '../../utils/assetPath';

type ProductDetailModalProps = {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (itemId: number) => Promise<void>;
};

export function ProductDetailModal({ item, onClose, onAddToCart }: ProductDetailModalProps) {
  const [adding,   setAdding]   = useState(false);
  const [added,    setAdded]    = useState(false);
  const [imgError, setImgError] = useState(false);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal product-modal" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <span className="modal-title">商品詳情</span>
          <button className="modal-close" onClick={onClose} aria-label="關閉">×</button>
        </div>

        <div className="modal-body">
          <div className="product-modal-img">
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

          {item.category_name && (
            <span className="menu-card-category">{item.category_name}</span>
          )}

          <h2 className="product-modal-name">{item.item_name}</h2>

          {item.description && (
            <p className="product-modal-desc">{item.description}</p>
          )}

          <div className="product-modal-action">
            <span className="product-modal-price">{formatCurrency(item.price)}</span>
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={adding || added}
            >
              {adding ? '加入中...' : added ? '已加入' : '加入購物車'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

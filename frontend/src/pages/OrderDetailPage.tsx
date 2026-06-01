import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiGetOrderDetail } from '../api/orderApi';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge';
import { formatCurrency } from '../utils/formatCurrency';
import type { OrderDetail } from '../types/order';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath  = (location.state as { fromPath?: string })?.fromPath  ?? '/orders';
  const returnLabel = (location.state as { fromLabel?: string })?.fromLabel ?? '我的訂單';
  const [order, setOrder]   = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const orderId = Number(id);
    if (!orderId) { setError('無效的訂單編號'); setLoading(false); return; }
    apiGetOrderDetail(orderId)
      .then(setOrder)
      .catch(() => setError('訂單不存在或您無權限查看'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>載入中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="breadcrumb">
        <button className="breadcrumb-link" onClick={() => navigate(returnPath)}>
          {returnLabel}
        </button>
        <span>/</span>
        <span>訂單詳情</span>
      </div>

      {error && (
        <div className="order-detail-error-state">
          <div className="order-detail-error-card">
            <div className="order-detail-error-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="11"/>
                <line x1="11" y1="14" x2="11.01" y2="14"/>
              </svg>
            </div>
            <p className="order-detail-error-title">找不到這筆訂單</p>
            <p className="order-detail-error-text">
              這筆訂單可能不存在，或目前無法查看。{'\n'}請回到訂單列表重新確認。
            </p>
            <div className="order-detail-error-actions">
              <button className="order-detail-error-link" onClick={() => navigate(returnPath)}>
                ← 返回{returnLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {order && (
        <div className="order-detail-body">
          <div className="order-detail-card">
            <p className="order-detail-card-title">訂單資訊</p>
            <div className="order-info-grid">
              <div>
                <p className="order-info-item-label">訂單狀態</p>
                <OrderStatusBadge status={order.order_status} />
              </div>
              <div>
                <p className="order-info-item-label">總金額</p>
                <p className="order-info-item-value order-total-highlight">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
              <div className="order-info-time-row">
                <p className="order-info-item-label">下單時間</p>
                <p className="order-info-item-value">{formatDateTime(order.order_time)}</p>
              </div>
              <div>
                <p className="order-info-item-label">付款方式</p>
                <p className="order-info-item-value">現場付款</p>
              </div>
            </div>
          </div>

          <button className="order-back-link" onClick={() => navigate(returnPath)}>
            ← 返回{returnLabel}
          </button>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>品項</th>
                  <th>單價</th>
                  <th>數量</th>
                  <th style={{ textAlign: 'right' }}>小計</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.item_id}>
                    <td>{item.item_name}</td>
                    <td>{formatCurrency(item.unit_price)}</td>
                    <td>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

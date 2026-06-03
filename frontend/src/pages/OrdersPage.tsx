import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiGetMyOrders } from '../api/orderApi';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency } from '../utils/formatCurrency';
import type { Order } from '../types/order';

type Props = {
  mode: 'active' | 'history';
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export function OrdersPage({ mode }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const [orderSuccess] = useState<boolean>(() =>
    mode === 'active' && new URLSearchParams(location.search).get('created') === '1'
  );

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (orderSuccess) {
      navigate('/orders', { replace: true });
    }
  }, [orderSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    setError('');
    apiGetMyOrders(mode)
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : '載入訂單失敗，請稍後再試'))
      .finally(() => setLoading(false));
  }, [mode]);

  const title    = mode === 'active' ? '我的訂單' : '訂單紀錄';
  const subtitle = mode === 'active'
    ? '顯示目前待處理與準備中的訂單'
    : '查看所有過去與目前的訂餐紀錄';

  const navToDetail = (orderId: number) => {
    navigate(`/orders/${orderId}`, {
      state: {
        fromPath:  mode === 'active' ? '/orders' : '/orders/history',
        fromLabel: mode === 'active' ? '我的訂單' : '訂單紀錄',
      },
    });
  };

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

  const orderIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );

  return (
    <div className="page-content">
      <h1 className="page-title">{title}</h1>
      <p className="orders-page-subtitle">{subtitle}</p>

      {orderSuccess && (
        <div className="alert alert-success order-success-banner">
          <p className="order-success-banner-title">訂單已成功送出！</p>
          <p className="order-success-banner-body">我們已收到您的訂單，請於櫃台完成付款並稍候店家處理。</p>
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}

      {orders.length === 0 ? (
        mode === 'active' ? (
          <EmptyState
            icon={orderIcon}
            title="目前沒有進行中的訂單"
            description={'您最近送出的訂單會顯示在這裡。\n想查看過去的訂餐內容，可以到訂單紀錄查看。'}
            ctaLabel="訂單紀錄"
            onCta={() => navigate('/orders/history')}
          />
        ) : (
          <EmptyState
            icon={orderIcon}
            title="你還沒有任何訂餐紀錄"
            description={'要不要試試我們的總匯吐司？\n完成點餐後，您的訂單紀錄會顯示在這裡。'}
            ctaLabel="前往菜單"
            onCta={() => navigate('/menu')}
          />
        )
      ) : (
        <div className="orders-list-body">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>下單時間</th>
                  <th>金額</th>
                  <th>狀態</th>
                  <th>詳情</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.order_id}
                    className="orders-table-row"
                    onClick={() => navToDetail(order.order_id)}
                  >
                    <td>{formatDateTime(order.order_time)}</td>
                    <td style={{ fontWeight: 700, color: '#1E293B' }}>{formatCurrency(order.total_amount)}</td>
                    <td><OrderStatusBadge status={order.order_status} /></td>
                    <td>
                      <button
                        className="order-detail-link"
                        onClick={(e) => { e.stopPropagation(); navToDetail(order.order_id); }}
                      >
                        查看詳情 →
                      </button>
                    </td>
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

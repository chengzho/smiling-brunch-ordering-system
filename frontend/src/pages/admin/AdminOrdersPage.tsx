import { useState, useEffect, useCallback } from 'react';
import { apiAdminGetOrders, apiAdminUpdateOrderStatus } from '../../api/adminApi';
import { formatCurrency } from '../../utils/formatCurrency';
import type { Order, OrderStatus } from '../../types/order';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending',   label: '待處理' },
  { value: 'preparing', label: '準備中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export function AdminOrdersPage() {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  const loadOrders = useCallback(() => {
    setLoading(true);
    apiAdminGetOrders()
      .then(setOrders)
      .catch(() => setError('載入訂單失敗'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    setUpdating(orderId);
    setError('');
    try {
      await apiAdminUpdateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => o.order_id === orderId ? { ...o, order_status: newStatus } : o)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新狀態失敗');
    } finally {
      setUpdating(null);
    }
  };

  const pendingCount   = orders.filter(o => o.order_status === 'pending').length;
  const preparingCount = orders.filter(o => o.order_status === 'preparing').length;
  const completedCount = orders.filter(o => o.order_status === 'completed').length;
  const cancelledCount = orders.filter(o => o.order_status === 'cancelled').length;

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-orders-header-left">
          <h1>訂單管理</h1>
          {!loading && (
            <div className="admin-orders-summary">
              <span className="admin-orders-summary-item admin-orders-summary-pending">
                待處理：<strong>{pendingCount}</strong>
              </span>
              <span className="admin-orders-summary-item admin-orders-summary-preparing">
                準備中：<strong>{preparingCount}</strong>
              </span>
              <span className="admin-orders-summary-item admin-orders-summary-completed">
                已完成：<strong>{completedCount}</strong>
              </span>
              <span className="admin-orders-summary-item admin-orders-summary-cancelled">
                已取消：<strong>{cancelledCount}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state"><div className="loading-spinner" /><span>載入中...</span></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>訂單編號</th>
                <th>狀態</th>
                <th>顧客</th>
                <th>金額</th>
                <th>下單時間</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-empty-cell">尚無訂單</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.order_id}
                    className={order.order_status === 'cancelled' ? 'admin-order-row-cancelled' : undefined}
                  >
                    <td className="admin-order-id">#{order.order_id}</td>
                    <td>
                      <select
                        className={`admin-order-status-select admin-order-status-${order.order_status}`}
                        value={order.order_status}
                        disabled={updating === order.order_id}
                        onChange={(e) =>
                          handleStatusChange(order.order_id, e.target.value as OrderStatus)
                        }
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>{order.customer_name ?? '—'}</td>
                    <td className="admin-order-amount">{formatCurrency(order.total_amount)}</td>
                    <td>{formatDateTime(order.order_time)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiGetDashboardStats, apiAdminGetOrders } from '../../api/adminApi';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import type { DashboardStats } from '../../api/adminApi';
import type { Order } from '../../types/order';

const CAPACITY_LIMIT     = 30;
const CAPACITY_WARNING   = 25;

const ORDER_WARNING_THRESHOLD = 10;
const ORDER_CAPACITY_LIMIT    = 15;

type WorkloadState = 'safe' | 'warning' | 'danger';

function getWorkloadState(count: number): WorkloadState {
  if (count >= ORDER_CAPACITY_LIMIT)    return 'danger';
  if (count >= ORDER_WARNING_THRESHOLD) return 'warning';
  return 'safe';
}

function getWorkloadStatusLabel(state: WorkloadState): string {
  if (state === 'danger')  return '已達上限';
  if (state === 'warning') return '接近上限';
  return '安全範圍';
}

function getWorkloadColor(state: WorkloadState): string {
  if (state === 'danger')  return '#DC2626';
  if (state === 'warning') return '#F59E0B';
  return '#2F8F83';
}

function getPendingHelperText(state: WorkloadState): string {
  if (state === 'danger')  return '待確認訂單已達建議上限，建議立即處理或暫緩接單。';
  if (state === 'warning') return '待確認訂單接近建議上限，建議優先確認新訂單。';
  return '目前待確認訂單仍在可快速處理的範圍內。';
}

function getPreparingHelperText(state: WorkloadState): string {
  if (state === 'danger')  return '準備中訂單已達建議上限，出餐壓力偏高。';
  if (state === 'warning') return '準備中訂單接近建議上限，建議評估廚房負載。';
  return '目前備餐量仍在可管理範圍內。';
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

type StatCardProps = {
  label: string;
  value: string | number;
  note?: string;
};

function StatCard({ label, value, note }: StatCardProps) {
  return (
    <div className="stat-card">
      <p className="stat-card-label">{label}</p>
      <div className="stat-card-value-row">
        <span className="stat-card-value">{value}</span>
        {note && <span className="stat-card-note-inline">{note}</span>}
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    Promise.all([apiGetDashboardStats(), apiAdminGetOrders()])
      .then(([s, o]) => {
        setStats(s);
        setOrders(o);
      })
      .catch((err) => setError(err instanceof Error ? err.message : '載入儀表板資料失敗'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="admin-page-header"><h1>儀表板</h1></div>
        <div className="loading-state"><div className="loading-spinner" /><span>載入中...</span></div>
      </div>
    );
  }

  const allActionOrders = orders.filter(
    o => o.order_status === 'pending' || o.order_status === 'preparing'
  );
  const actionOrders   = allActionOrders.slice(0, 5);
  const actionOverflow = allActionOrders.length > 5 ? allActionOrders.length - 5 : 0;

  const recentOrders = orders.slice(0, 5);

  const current      = stats?.available_menu_count ?? 0;
  const capacityFill = Math.min((current / CAPACITY_LIMIT) * 100, 100);

  const capacityState: 'safe' | 'warning' | 'danger' =
    current >= CAPACITY_LIMIT   ? 'danger'  :
    current >= CAPACITY_WARNING ? 'warning' :
    'safe';

  const capacityLabel =
    capacityState === 'danger'  ? '已達上限' :
    capacityState === 'warning' ? '接近上限' :
    '安全範圍';

  const capacityColor =
    capacityState === 'danger'  ? '#DC2626' :
    capacityState === 'warning' ? '#F59E0B' :
    '#2F8F83';

  const capacityMsg =
    capacityState === 'danger'
      ? '餐點數量已達建議上限，建議暫緩新增品項。'
      : capacityState === 'warning'
      ? '餐點數量接近建議上限，建議評估備餐人力。'
      : '目前餐點數量仍在可管理範圍內。';

  const topProducts  = stats?.top_products  ?? [];
  const topCustomers = stats?.top_customers ?? [];
  const maxQty       = topProducts.length  > 0 ? topProducts[0].total_qty   : 1;
  const maxOrders    = topCustomers.length > 0 ? topCustomers[0].order_count : 1;

  const pendingCount   = stats?.pending_order_count   ?? 0;
  const preparingCount = stats?.preparing_order_count  ?? 0;
  const pendingState   = getWorkloadState(pendingCount);
  const preparingState = getWorkloadState(preparingCount);
  const pendingFill    = Math.min((pendingCount   / ORDER_CAPACITY_LIMIT) * 100, 100);
  const preparingFill  = Math.min((preparingCount / ORDER_CAPACITY_LIMIT) * 100, 100);

  return (
    <div>
      <div className="admin-page-header"><h1>儀表板</h1></div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── 營運總覽: 4 summary KPI cards ── */}
      {stats && (
        <div className="dashboard-summary-grid">
          <StatCard label="總訂單數"     value={stats.order_count}                      note="包含所有訂單狀態" />
          <StatCard label="總會員數"     value={stats.customer_count}                   note="目前註冊顧客數" />
          <StatCard label="可供應餐點"   value={stats.available_menu_count}             note="目前上架中的餐點" />
          <StatCard label="已完成銷售額" value={formatCurrency(stats.completed_sales)}  note="僅統計已完成訂單" />
        </div>
      )}

      {/* ── 目前訂單負載: 2 workload cards ── */}
      {stats && (
        <div className="dashboard-workload-grid">

          <div className={`dashboard-workload-card${pendingState !== 'safe' ? ` workload-card-${pendingState}` : ''}`}>
            <p className="dashboard-section-title">待處理訂單</p>
            <div className="workload-main-row">
              <p className="workload-main-value">
                目前 <strong>{pendingCount}</strong> / {ORDER_CAPACITY_LIMIT}
              </p>
              <span className={`workload-status workload-status-${pendingState}`}>
                {getWorkloadStatusLabel(pendingState)}
              </span>
            </div>
            <div className="workload-bar-wrap">
              <div
                className="workload-bar-fill"
                style={{ width: `${pendingFill}%`, background: getWorkloadColor(pendingState) }}
              />
            </div>
            <p className="workload-helper-text">{getPendingHelperText(pendingState)}</p>
            <div className="workload-meta-grid">
              <div className="workload-meta-item">
                <span className="workload-meta-label">目前數量</span>
                <span className="workload-meta-value">{pendingCount}</span>
              </div>
              <div className="workload-meta-item">
                <span className="workload-meta-label">提醒門檻</span>
                <span className="workload-meta-value">{ORDER_WARNING_THRESHOLD}</span>
              </div>
              <div className="workload-meta-item">
                <span className="workload-meta-label">建議上限</span>
                <span className="workload-meta-value">{ORDER_CAPACITY_LIMIT}</span>
              </div>
              <div className="workload-meta-item">
                <span className="workload-meta-label">剩餘容量</span>
                <span className="workload-meta-value">{Math.max(ORDER_CAPACITY_LIMIT - pendingCount, 0)}</span>
              </div>
            </div>
          </div>

          <div className={`dashboard-workload-card${preparingState !== 'safe' ? ` workload-card-${preparingState}` : ''}`}>
            <p className="dashboard-section-title">準備中訂單</p>
            <div className="workload-main-row">
              <p className="workload-main-value">
                目前 <strong>{preparingCount}</strong> / {ORDER_CAPACITY_LIMIT}
              </p>
              <span className={`workload-status workload-status-${preparingState}`}>
                {getWorkloadStatusLabel(preparingState)}
              </span>
            </div>
            <div className="workload-bar-wrap">
              <div
                className="workload-bar-fill"
                style={{ width: `${preparingFill}%`, background: getWorkloadColor(preparingState) }}
              />
            </div>
            <p className="workload-helper-text">{getPreparingHelperText(preparingState)}</p>
            <div className="workload-meta-grid">
              <div className="workload-meta-item">
                <span className="workload-meta-label">目前數量</span>
                <span className="workload-meta-value">{preparingCount}</span>
              </div>
              <div className="workload-meta-item">
                <span className="workload-meta-label">提醒門檻</span>
                <span className="workload-meta-value">{ORDER_WARNING_THRESHOLD}</span>
              </div>
              <div className="workload-meta-item">
                <span className="workload-meta-label">建議上限</span>
                <span className="workload-meta-value">{ORDER_CAPACITY_LIMIT}</span>
              </div>
              <div className="workload-meta-item">
                <span className="workload-meta-label">剩餘容量</span>
                <span className="workload-meta-value">{Math.max(ORDER_CAPACITY_LIMIT - preparingCount, 0)}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── Middle: need-attention table + capacity bar ── */}
      <div className="dashboard-grid-2col">

        <div className="dashboard-card">
          <p className="dashboard-section-title">需要處理的訂單</p>
          {actionOrders.length === 0 ? (
            <p className="dashboard-empty-text">目前沒有需要處理的訂單</p>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>訂單編號</th>
                      <th>顧客</th>
                      <th>下單時間</th>
                      <th>金額</th>
                      <th>狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actionOrders.map((order) => (
                      <tr
                        key={order.order_id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/admin/orders')}
                      >
                        <td>#{order.order_id}</td>
                        <td>{order.customer_name ?? '—'}</td>
                        <td>{formatDateTime(order.order_time)}</td>
                        <td>{formatCurrency(order.total_amount)}</td>
                        <td><OrderStatusBadge status={order.order_status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {actionOverflow > 0 && (
                <div className="dashboard-card-footer">
                  <Link to="/admin/orders" className="dashboard-link">
                    還有 {actionOverflow} 筆訂單需要處理，前往訂單管理 →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        <div className="dashboard-card">
          <p className="dashboard-section-title">菜單供應容量</p>
          <div className="capacity-header">
            <p className="capacity-count">
              目前 <strong>{current}</strong> / {CAPACITY_LIMIT}
            </p>
            <span className={`capacity-status capacity-status-${capacityState}`}>
              {capacityLabel}
            </span>
          </div>
          <div className="capacity-bar-wrap">
            <div
              className="capacity-bar-fill"
              style={{ width: `${capacityFill}%`, background: capacityColor }}
            />
          </div>
          <p className="capacity-msg">{capacityMsg}</p>
          <div className="capacity-meta-grid">
            <div className="capacity-meta-item">
              <span>目前品項</span>
              <strong>{current}</strong>
            </div>
            <div className="capacity-meta-item">
              <span>提醒門檻</span>
              <strong>{CAPACITY_WARNING}</strong>
            </div>
            <div className="capacity-meta-item">
              <span>建議上限</span>
              <strong>{CAPACITY_LIMIT}</strong>
            </div>
            <div className="capacity-meta-item">
              <span>剩餘可新增</span>
              <strong>{Math.max(CAPACITY_LIMIT - current, 0)}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom: top products + top customers + recent orders ── */}
      <div className="dashboard-grid-3col">

        <div className="dashboard-card">
          <p className="dashboard-section-title">熱銷餐點 Top 3</p>
          {topProducts.length === 0 ? (
            <p className="dashboard-empty-text">暫無熱銷資料</p>
          ) : (
            <ul className="rank-list">
              {topProducts.map((p, i) => (
                <li key={p.item_name} className="rank-item">
                  <div className="rank-item-header">
                    <span className="rank-num">{i + 1}</span>
                    <span className="rank-name">{p.item_name}</span>
                    <span className="rank-meta">{p.total_qty} 份</span>
                  </div>
                  <div className="rank-bar-wrap">
                    <div
                      className="rank-bar-fill"
                      style={{ width: `${(p.total_qty / maxQty) * 100}%` }}
                    />
                  </div>
                  <p className="rank-sub">{formatCurrency(p.total_revenue)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboard-card">
          <p className="dashboard-section-title">常客排行 Top 3</p>
          {topCustomers.length === 0 ? (
            <p className="dashboard-empty-text">暫無常客資料</p>
          ) : (
            <ul className="rank-list">
              {topCustomers.map((c, i) => (
                <li key={c.customer_name} className="rank-item">
                  <div className="rank-item-header">
                    <span className="rank-num">{i + 1}</span>
                    <span className="rank-name">{c.customer_name}</span>
                    <span className="rank-meta">{c.order_count} 筆訂單</span>
                  </div>
                  <div className="rank-bar-wrap">
                    <div
                      className="rank-bar-fill"
                      style={{ width: `${(c.order_count / maxOrders) * 100}%` }}
                    />
                  </div>
                  <p className="rank-sub">{formatCurrency(c.total_spent)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboard-card">
          <p className="dashboard-section-title">最近訂單</p>
          {recentOrders.length === 0 ? (
            <p className="dashboard-empty-text">暫無訂單資料</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>訂單編號</th>
                    <th>顧客</th>
                    <th>金額</th>
                    <th>狀態</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.order_id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate('/admin/orders')}
                    >
                      <td>#{order.order_id}</td>
                      <td>{order.customer_name ?? '—'}</td>
                      <td>{formatCurrency(order.total_amount)}</td>
                      <td><OrderStatusBadge status={order.order_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

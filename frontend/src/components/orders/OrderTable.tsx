import type { Order } from '../../types/order';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

type OrderTableProps = {
  orders: Order[];
  onViewDetail?: (orderId: number) => void;
};

export function OrderTable({ orders, onViewDetail }: OrderTableProps) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>訂單編號</th>
          <th>日期</th>
          <th>金額</th>
          <th>狀態</th>
          {onViewDetail && <th>操作</th>}
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.order_id}>
            <td>#{order.order_id}</td>
            <td>{formatDate(order.order_time)}</td>
            <td>{formatCurrency(order.total_amount)}</td>
            <td><OrderStatusBadge status={order.order_status} /></td>
            {onViewDetail && (
              <td>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => onViewDetail(order.order_id)}
                >
                  查看詳情
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

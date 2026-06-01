import type { OrderStatus } from '../../types/order';

function CircleIcon({ color }: { color: string }) {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="4.5" cy="4.5" r="3.5" fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" style={{ flexShrink: 0 }}>
      <polyline points="1.5,5.5 4,8 8.5,2" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon({ color }: { color: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" style={{ flexShrink: 0 }}>
      <line x1="2" y1="2" x2="8" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="2" x2="2" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

type IconComponent = (props: { color: string }) => JSX.Element;

type StatusEntry = {
  label: string;
  className: string;
  Icon: IconComponent;
  iconColor: string;
};

const STATUS_MAP: Record<OrderStatus, StatusEntry> = {
  pending:   { label: '待處理', className: 'badge-pending',   Icon: CircleIcon, iconColor: '#92400E' },
  preparing: { label: '準備中', className: 'badge-preparing', Icon: CircleIcon, iconColor: '#1E40AF' },
  completed: { label: '已完成', className: 'badge-completed', Icon: CheckIcon, iconColor: '#166534' },
  cancelled: { label: '已取消', className: 'badge-cancelled', Icon: XIcon,     iconColor: '#991B1B' },
};

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const { label, className, Icon, iconColor } = STATUS_MAP[status] ?? STATUS_MAP.pending;
  return (
    <span className={`order-badge ${className}`}>
      <Icon color={iconColor} />
      {label}
    </span>
  );
}

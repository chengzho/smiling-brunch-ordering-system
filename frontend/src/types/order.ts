export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled';

export type Order = {
  order_id: number;
  user_id?: number;
  customer_name?: string;
  total_amount: number;
  order_status: OrderStatus;
  order_time: string;
};

export type OrderDetailItem = {
  item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export type OrderDetail = {
  order_id: number;
  total_amount: number;
  order_status: OrderStatus;
  order_time: string;
  items: OrderDetailItem[];
};

export type CartItem = {
  cart_item_id: number;
  item_id: number;
  item_name: string;
  price: number;
  image_url: string;
  quantity: number;
  subtotal: number;
};

export type Cart = {
  items: CartItem[];
  total_amount: number;
};

export type Category = {
  category_id: number;
  category_name: string;
  description: string;
  item_count?: number;
};

export type MenuItem = {
  item_id: number;
  category_id: number;
  category_name?: string;
  item_name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: number;
};

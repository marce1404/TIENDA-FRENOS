export interface Product {
  id: number;
  code: string;
  name: string;
  brand: string;
  model: string;
  compatibility: string;
  price: number;
  category: string;
  isFeatured: boolean;
  imageUrl?: string | null;
  isOnSale?: boolean | null;
  salePrice?: number | null;
}

export interface CartItem extends Product {
  quantity: number;
}

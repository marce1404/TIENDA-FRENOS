
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
  imageUrl?: string;
  isOnSale?: boolean;
  salePrice?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

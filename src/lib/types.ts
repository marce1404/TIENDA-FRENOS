
export interface Product {
  id: number;
  name: string;
  brand: string;
  model: string;
  compatibility: string;
  price: number;
  category: string;
  isFeatured: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}


export interface Product {
  id: number;
  name: string;
  brand: string;
  compatibility: string;
  price: number;
  category: 'Discos' | 'Pastillas' | 'Kits';
  imageUrl: string;
}

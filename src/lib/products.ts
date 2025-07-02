
'use client';

import { products as initialProducts } from '@/data/products';
import type { Product } from '@/lib/types';

// This function should only be called on the client-side.
export function getProducts(): Product[] {
  if (typeof window === 'undefined') {
    return initialProducts;
  }
  
  const savedProductsJSON = localStorage.getItem('products');
  
  if (savedProductsJSON) {
    try {
      return JSON.parse(savedProductsJSON);
    } catch (e) {
      console.error('Error parsing products from localStorage', e);
      // If parsing fails, fall back to initial data
      return initialProducts;
    }
  }

  // If no products in localStorage, initialize with static data and save it.
  localStorage.setItem('products', JSON.stringify(initialProducts));
  return initialProducts;
}

// This function should only be called on the client-side.
export function saveProducts(products: Product[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('products', JSON.stringify(products));
}


'use client';

import { products as initialProducts } from '@/data/products';
import type { Product } from '@/lib/types';

// This function should only be called on the client-side.
export function getProducts(): Product[] {
  if (typeof window === 'undefined') {
    // During server-side rendering, always return the initial list.
    return initialProducts;
  }
  
  try {
    const savedProductsJSON = localStorage.getItem('products');
    
    // If no products in storage, initialize with default list
    if (!savedProductsJSON) {
       localStorage.setItem('products', JSON.stringify(initialProducts));
       return initialProducts;
    }

    const productsFromStorage: Product[] = JSON.parse(savedProductsJSON);
    
    // If stored products are not a valid array or are empty, re-initialize
    if (!Array.isArray(productsFromStorage) || productsFromStorage.length === 0) {
       localStorage.setItem('products', JSON.stringify(initialProducts));
       return initialProducts;
    }
    
    return productsFromStorage;

  } catch (e) {
    // If any other error occurs (e.g., parsing fails),
    // fall back to the initial product list and re-initialize localStorage.
    console.error('Error reading products from localStorage, falling back to initial data.', e);
    localStorage.setItem('products', JSON.stringify(initialProducts));
    return initialProducts;
  }
}

// This function should only be called on the client-side.
export function saveProducts(products: Product[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('products', JSON.stringify(products));
}

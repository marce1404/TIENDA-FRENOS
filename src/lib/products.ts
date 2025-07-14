
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
    
    if (!savedProductsJSON) {
       throw new Error("No products in localStorage.");
    }

    const productsFromStorage: Product[] = JSON.parse(savedProductsJSON);
    
    // Basic validation: ensure it's an array and not empty.
    if (!Array.isArray(productsFromStorage) || productsFromStorage.length === 0) {
       throw new Error("Stored products is not a valid array or is empty.");
    }
    
    return productsFromStorage;

  } catch (e) {
    // If any error occurs (e.g., parsing fails, data is invalid, or not present),
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

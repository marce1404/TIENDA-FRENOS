
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
    
    if (savedProductsJSON) {
        const productsFromStorage = JSON.parse(savedProductsJSON);
        // Ensure it's a non-empty array before returning
        if (Array.isArray(productsFromStorage) && productsFromStorage.length > 0) {
            return productsFromStorage;
        }
    }

    // If localStorage is empty, invalid, or contains an empty array,
    // initialize with default list, save it, and return it.
    localStorage.setItem('products', JSON.stringify(initialProducts));
    return initialProducts;

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


'use client';

import { products as initialProducts } from '@/data/products';
import type { Product } from '@/lib/types';

// This function can be called on both server and client.
export function getProducts(): Product[] {
  // If we're on the server, there's no localStorage. Return the initial list.
  if (typeof window === 'undefined') {
    return initialProducts;
  }
  
  try {
    const savedProductsJSON = localStorage.getItem('products');
    
    if (savedProductsJSON) {
        const productsFromStorage = JSON.parse(savedProductsJSON);
        // Ensure it's a non-empty array before returning
        if (Array.isArray(productsFromStorage)) {
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
    try {
        localStorage.setItem('products', JSON.stringify(initialProducts));
    } catch (saveError) {
        console.error('Failed to save initial products to localStorage.', saveError);
    }
    return initialProducts;
  }
}

// This function should only be called on the client-side.
export function saveProducts(products: Product[]): void {
  if (typeof window === 'undefined') {
    console.warn('saveProducts was called on the server. Data will not be persisted.');
    return;
  }
  try {
    localStorage.setItem('products', JSON.stringify(products));
  } catch(e) {
    console.error('Failed to save products to localStorage.', e);
  }
}


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
    
    // If there are no saved products, initialize with the default list.
    if (!savedProductsJSON) {
      localStorage.setItem('products', JSON.stringify(initialProducts));
      return initialProducts;
    }

    const productsFromStorage: Product[] = JSON.parse(savedProductsJSON);
    
    // Basic validation: ensure it's an array and not empty.
    if (!Array.isArray(productsFromStorage)) {
       throw new Error("Stored products is not an array");
    }

    // If for some reason the stored array is empty, re-initialize.
    if (productsFromStorage.length === 0) {
        throw new Error("Stored products is an empty array.");
    }
    
    return productsFromStorage;

  } catch (e) {
    console.error('Error parsing products from localStorage, falling back to initial data.', e);
    // If parsing fails or data is invalid, it means the data is corrupt. Reset to initial products.
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

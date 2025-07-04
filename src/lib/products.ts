
'use client';

import { products as initialProducts } from '@/data/products';
import type { Product } from '@/lib/types';

// This function should only be called on the client-side.
export function getProducts(): Product[] {
  if (typeof window === 'undefined') {
    return initialProducts;
  }
  
  const savedProductsJSON = localStorage.getItem('products');
  
  // If there are no saved products, initialize with the default list.
  if (!savedProductsJSON) {
    localStorage.setItem('products', JSON.stringify(initialProducts));
    return initialProducts;
  }

  try {
    const productsFromStorage: Product[] = JSON.parse(savedProductsJSON);

    // Basic validation: Check if products in storage have a valid structure.
    const hasValidStructure = productsFromStorage.every(p => 
        'id' in p && 'name' in p && 'category' in p && typeof p.isFeatured === 'boolean'
    );
    
    // Check if there are any categories that are not 'Pastillas' or 'Discos'
    const allowedCategories = new Set(['Pastillas', 'Discos']);
    const hasInvalidCategories = productsFromStorage.some(p => !allowedCategories.has(p.category));

    // If structure is invalid or there are disallowed categories, reset with initial products.
    if (!hasValidStructure || hasInvalidCategories) {
      localStorage.setItem('products', JSON.stringify(initialProducts));
      return initialProducts;
    }
    
    return productsFromStorage;

  } catch (e) {
    console.error('Error parsing products from localStorage, falling back to initial data.', e);
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

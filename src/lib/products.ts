'use client';

import { products as initialProducts } from '@/data/products';
import type { Product } from '@/lib/types';

// This function should only be called on the client-side.
export function getProducts(): Product[] {
  if (typeof window === 'undefined') {
    return initialProducts;
  }
  
  const savedProductsJSON = localStorage.getItem('products');
  let productsFromStorage: Product[] = [];

  if (savedProductsJSON) {
    try {
      productsFromStorage = JSON.parse(savedProductsJSON);
    } catch (e) {
      console.error('Error parsing products from localStorage, falling back to initial data.', e);
      productsFromStorage = [];
    }
  }

  // If the stored products contain categories that are not in the master list,
  // or if storage is empty, reset it. This is the source of truth.
  const validCategories = new Set(initialProducts.map(p => p.category));
  const storageHasInvalidCategories = productsFromStorage.some(p => !validCategories.has(p.category));

  if (productsFromStorage.length === 0 || storageHasInvalidCategories) {
    productsFromStorage = initialProducts;
    localStorage.setItem('products', JSON.stringify(productsFromStorage));
  }
  
  let productsToAugment = productsFromStorage;
  
  const categoryImagesJSON = localStorage.getItem('categoryImages');
  const categoryImages: Record<string, string> = categoryImagesJSON ? JSON.parse(categoryImagesJSON) : {};

  const augmentedProducts = productsToAugment.map(product => {
    // A product has a specific image if its URL is a data URI.
    if (product.imageUrl && product.imageUrl.startsWith('data:image')) {
      return product;
    }
    
    // Otherwise, it needs a default. Try category-specific first.
    const defaultImageUrl = categoryImages[product.category] || 'https://placehold.co/400x400.png';
    
    return {
      ...product,
      imageUrl: defaultImageUrl,
    };
  });

  return augmentedProducts;
}

// This function should only be called on the client-side.
export function saveProducts(products: Product[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('products', JSON.stringify(products));
}

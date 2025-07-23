
import type { Product } from '@/lib/types';
import { products as staticProducts } from '@/data/products';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * Fetches all products from the static data file.
 * Uses noStore() to ensure data is always fresh.
 * @returns {Promise<Product[]>} A promise that resolves to an array of products.
 */
export async function getProducts(): Promise<Product[]> {
  noStore(); // Prevents caching of this data
  // NOTE: This is reading from the static file, not the database.
  return Promise.resolve(staticProducts);
}

/**
 * Fetches a single product by its ID from the static data file.
 * @param {number} id The ID of the product to fetch.
 * @returns {Promise<Product | null>} A promise that resolves to the product or null if not found.
 */
export async function getProductById(id: number): Promise<Product | null> {
    noStore();
    // NOTE: This is reading from the static file, not the database.
    const product = staticProducts.find(p => p.id === id);
    return Promise.resolve(product || null);
}

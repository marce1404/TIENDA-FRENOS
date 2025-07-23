

import type { Product } from '@/lib/types';
import { db } from './db/drizzle';
import { products } from './db/schema';
import { eq } from 'drizzle-orm';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * Fetches all products from the database.
 * Uses noStore() to ensure data is always fresh.
 * @returns {Promise<Product[]>} A promise that resolves to an array of products.
 */
export async function getProducts(): Promise<Product[]> {
  noStore();
  try {
    const dbProducts = await db.select().from(products);
    // Drizzle returns numeric types as strings from some drivers, this ensures they are numbers.
    return dbProducts.map(p => ({
      ...p,
      price: Number(p.price),
      salePrice: p.salePrice != null ? Number(p.salePrice) : null, // Handle null properly
    }));
  } catch (error) {
    console.error("FATAL: Database query for all products failed. Check connection and credentials.", error);
    // Re-throw the error to make it visible to Next.js and the user.
    // Hiding this error by returning an empty array was the root cause of the "product not showing" issue.
    throw error;
  }
}

/**
 * Fetches a single product by its ID from the database.
 * @param {number} id The ID of the product to fetch.
 * @returns {Promise<Product | null>} A promise that resolves to the product or null if not found.
 */
export async function getProductById(id: number): Promise<Product | null> {
    noStore();
    try {
        const result = await db.select().from(products).where(eq(products.id, id));
        if (result.length === 0) {
            return null;
        }
        const dbProduct = result[0];
        // Ensure numeric types are correctly parsed to numbers.
        return {
          ...dbProduct,
          price: Number(dbProduct.price),
          salePrice: dbProduct.salePrice != null ? Number(dbProduct.salePrice) : null,
        };
    } catch (error) {
        console.error(`FATAL: Database query for product ${id} failed. Check connection and credentials.`, error);
        // Re-throw for visibility, consistent with getProducts.
        throw error;
    }
}

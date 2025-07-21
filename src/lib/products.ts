
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
  noStore(); // Prevents caching of this data
  try {
    const data = await db.select().from(products).orderBy(products.id);
    // The data from the DB should already match the Product type.
    // Drizzle with Zod schemas would provide stronger typing here.
    return data as Product[];
  } catch (error) {
    console.error("Database Error:", error);
    // In case of a DB error, we can return an empty array 
    // or throw the error depending on desired behavior.
    return [];
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
        const productArray = await db.select().from(products).where(eq(products.id, id)).limit(1);
        if (productArray.length === 0) {
            return null;
        }
        return productArray[0] as Product;
    } catch (error) {
        console.error("Database error fetching product by ID:", error);
        return null;
    }
}

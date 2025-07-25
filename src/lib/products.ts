
'use server';

import type { Product } from '@/lib/types';
import { db } from './db/drizzle';
import { products } from './db/schema';
import { eq } from 'drizzle-orm';
import { unstable_noStore as noStore } from 'next/cache';

const DEFAULT_PASTILLA_IMAGE_URL = 'https://res.cloudinary.com/repufrenos/image/upload/v1716335805/repufrenos/defaults/default_pastilla.png';
const DEFAULT_DISCO_IMAGE_URL = 'https://res.cloudinary.com/repufrenos/image/upload/v1716335805/repufrenos/defaults/default_disco.png';

/**
 * Maps a raw database product to a fully-formed Product object,
 * ensuring it has a valid image URL.
 * @param {typeof products.$inferSelect} p The raw product from the database.
 * @returns {Product} The processed product with a guaranteed image URL.
 */
function mapDbProductToAppProduct(p: typeof products.$inferSelect): Product {
  let imageUrl = p.imageUrl;
  
  if (!imageUrl) {
    console.log(`[DEBUG] Product ID ${p.id} has no image. Category: ${p.category}. Assigning default.`);
    imageUrl = p.category === 'Pastillas' ? DEFAULT_PASTILLA_IMAGE_URL : DEFAULT_DISCO_IMAGE_URL;
  }
  
  return {
    ...p,
    price: Number(p.price),
    salePrice: p.salePrice != null ? Number(p.salePrice) : null,
    imageUrl: imageUrl, // Now guaranteed to be a valid URL string
  };
}

/**
 * Fetches all products from the database and assigns default images if necessary.
 * Uses noStore() to ensure data is always fresh.
 * @returns {Promise<Product[]>} A promise that resolves to an array of products.
 */
export async function getProducts(): Promise<Product[]> {
  noStore();
  console.log('[DEBUG] getProducts: Fetching all products from database.');
  try {
    const dbProducts = await db.select().from(products);
    console.log('[DEBUG] Raw products from DB:', JSON.stringify(dbProducts, null, 2));

    const processedProducts = dbProducts.map(mapDbProductToAppProduct);
    console.log('[DEBUG] Processed products with default images applied:', JSON.stringify(processedProducts, null, 2));

    return processedProducts;
  } catch (error) {
    console.error("[DEBUG] Database query for all products failed. Check connection and credentials.", error);
    return [];
  }
}

/**
 * Fetches a single product by its ID from the database and assigns a default image if necessary.
 * @param {number} id The ID of the product to fetch.
 * @returns {Promise<Product | null>} A promise that resolves to the product or null if not found.
 */
export async function getProductById(id: number): Promise<Product | null> {
    noStore();
    console.log(`[DEBUG] getProductById: Fetching product with ID: ${id}`);
    try {
        const result = await db.select().from(products).where(eq(products.id, id));
        if (result.length === 0) {
            console.log(`[DEBUG] Product with ID ${id} not found.`);
            return null;
        }
        console.log(`[DEBUG] Raw product from DB (ID: ${id}):`, JSON.stringify(result[0], null, 2));
        
        const processedProduct = mapDbProductToAppProduct(result[0]);
        console.log(`[DEBUG] Processed product (ID: ${id}):`, JSON.stringify(processedProduct, null, 2));
        
        return processedProduct;
    } catch (error) {
        console.error(`[DEBUG] Database query for product ${id} failed.`, error);
        return null;
    }
}

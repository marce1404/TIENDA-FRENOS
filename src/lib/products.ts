
'use server';

import type { Product } from '@/lib/types';
import { db } from './db/drizzle';
import { products } from './db/schema';
import { eq } from 'drizzle-orm';
import { unstable_noStore as noStore } from 'next/cache';
import { getEnvSettings } from './env';
import productsData from '@/data/products.json';

// This was the original, working list from v5.9, acting as a reliable fallback and base.
const MOCKED_PRODUCTS: Product[] = productsData as Product[];

/**
 * Maps a product from the JSON or database to a fully formed Product object,
 * ensuring it has a valid image URL. This logic is restored from v5.9.
 * @param {typeof products.$inferSelect} p The raw product from the data source.
 * @param {string | undefined} defaultPastillaUrl Default URL for brake pads.
 * @param {string | undefined} defaultDiscoUrl Default URL for brake discs.
 * @returns {Product} The processed product with a guaranteed image URL.
 */
function mapProductToAppProduct(
  p: typeof products.$inferSelect,
  defaultPastillaUrl: string | undefined,
  defaultDiscoUrl:string | undefined,
): Product {
    let finalImageUrl = p.imageUrl || null;

    if (!finalImageUrl) {
        if (p.category === 'Pastillas') {
            finalImageUrl = defaultPastillaUrl || null;
        } else if (p.category === 'Discos') {
            finalImageUrl = defaultDiscoUrl || null;
        }
    }
  
  return {
    ...p,
    price: Number(p.price),
    salePrice: p.salePrice != null && Number(p.salePrice) > 0 ? Number(p.salePrice) : null,
    isOnSale: p.isOnSale === true && p.salePrice != null && Number(p.salePrice) > 0,
    imageUrl: finalImageUrl,
  };
}

/**
 * Gets all products, starting with a reliable JSON file and then checking the database.
 * This ensures the application is always populated with data.
 * @returns {Promise<Product[]>} A promise that resolves to an array of products.
 */
export async function getProducts(): Promise<Product[]> {
  noStore();
  
  try {
    const settings = await getEnvSettings();
    // Use the JSON data as the primary source of truth for displaying products.
    // The database will be used for updates, creations, and deletions.
    const dbProducts = await db.select().from(products).catch(() => []);
    
    // Create a map of products from the database by their ID.
    const dbProductsMap = new Map(dbProducts.map(p => [p.id, p]));

    // Merge JSON data with any updates from the database.
    const combinedProducts = MOCKED_PRODUCTS.map(jsonProduct => {
        const dbProduct = dbProductsMap.get(jsonProduct.id);
        // If product exists in DB, use DB version. Otherwise, use JSON version.
        return dbProduct ? dbProduct : jsonProduct;
    });

    // Add any products that are in the database but not in the JSON file (e.g., newly created).
    dbProducts.forEach(dbProduct => {
        if (!MOCKED_PRODUCTS.some(p => p.id === dbProduct.id)) {
            combinedProducts.push(dbProduct);
        }
    });
    
    const processedProducts = combinedProducts.map(p => 
        mapProductToAppProduct(p, settings.DEFAULT_PASTILLA_IMAGE_URL, settings.DEFAULT_DISCO_IMAGE_URL)
    );
    return processedProducts;
  } catch (error) {
    console.error("CRITICAL: Failed to get products. Falling back to static data.", error);
    // Fallback to static data in case of unexpected errors
    return MOCKED_PRODUCTS;
  }
}

/**
 * Gets a single product by its ID from the database or the JSON fallback.
 * @param {number} id The ID of the product to get.
 * @returns {Promise<Product | null>} A promise that resolves to the product or null if not found.
 */
export async function getProductById(id: number): Promise<Product | null> {
    noStore();
    try {
        const settings = await getEnvSettings();
        const result = await db.select().from(products).where(eq(products.id, id));
        let productData = result.length > 0 ? result[0] : MOCKED_PRODUCTS.find(p => p.id === id);

        if (!productData) {
            return null;
        }
        
        const processedProduct = mapProductToAppProduct(productData, settings.DEFAULT_PASTILLA_IMAGE_URL, settings.DEFAULT_DISCO_IMAGE_URL);
        return processedProduct;
    } catch (error) {
        console.error(`CRITICAL: Database query for product ${id} failed.`, error);
        return null;
    }
}

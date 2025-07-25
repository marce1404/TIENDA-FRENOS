
'use server';

import type { Product } from '@/lib/types';
import { db } from './db/drizzle';
import { products } from './db/schema';
import { eq } from 'drizzle-orm';
import { unstable_noStore as noStore } from 'next/cache';

const DEFAULT_PASTILLA_IMAGE_URL = 'https://res.cloudinary.com/repufrenos/image/upload/v1716335805/repufrenos/defaults/default_pastilla.png';
const DEFAULT_DISCO_IMAGE_URL = 'https://res.cloudinary.com/repufrenos/image/upload/v1716335805/repufrenos/defaults/default_disco.png';


/**
 * Fetches all products from the database and assigns default images if necessary.
 * Uses noStore() to ensure data is always fresh.
 * @returns {Promise<Product[]>} A promise that resolves to an array of products.
 */
export async function getProducts(): Promise<Product[]> {
  noStore();
  try {
    const dbProducts = await db.select().from(products);
    
    // Process products to add default images on the server-side
    return dbProducts.map(p => {
      let imageUrl = p.imageUrl;
      if (!imageUrl) {
        if (p.category === 'Pastillas') {
          imageUrl = DEFAULT_PASTILLA_IMAGE_URL;
        } else if (p.category === 'Discos') {
          imageUrl = DEFAULT_DISCO_IMAGE_URL;
        }
      }

      return {
        ...p,
        price: Number(p.price),
        salePrice: p.salePrice != null ? Number(p.salePrice) : null,
        imageUrl: imageUrl, // Ensure imageUrl is assigned
      };
    });
  } catch (error) {
    console.error("Database query for all products failed. Check connection and credentials.", error);
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
    try {
        const result = await db.select().from(products).where(eq(products.id, id));
        if (result.length === 0) {
            return null;
        }
        const dbProduct = result[0];

        let imageUrl = dbProduct.imageUrl;
        if (!imageUrl) {
          if (dbProduct.category === 'Pastillas') {
            imageUrl = DEFAULT_PASTILLA_IMAGE_URL;
          } else if (dbProduct.category === 'Discos') {
            imageUrl = DEFAULT_DISCO_IMAGE_URL;
          }
        }
        
        return {
          ...dbProduct,
          price: Number(dbProduct.price),
          salePrice: dbProduct.salePrice != null ? Number(dbProduct.salePrice) : null,
          imageUrl: imageUrl, // Ensure imageUrl is assigned
        };
    } catch (error) {
        console.error(`Database query for product ${id} failed. Check connection and credentials.`, error);
        return null;
    }
}

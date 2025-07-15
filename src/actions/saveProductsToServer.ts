
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import type { Product } from '@/lib/types';
import { z } from 'zod';

// Define a schema for a single product to ensure type safety.
const productSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  brand: z.string(),
  model: z.string(),
  compatibility: z.string(),
  price: z.number(),
  category: z.string(),
  isFeatured: z.boolean(),
  imageUrl: z.string().optional(),
  isOnSale: z.boolean().optional(),
  salePrice: z.number().optional(),
});

// Define a schema for an array of products.
const productsSchema = z.array(productSchema);

/**
 * Saves the entire list of products to the products.json file on the server.
 * This function should only be called from a trusted environment (like the admin panel).
 * @param {Product[]} products The full, updated list of products to save.
 * @returns {Promise<{success: boolean; error?: string}>} An object indicating success or failure.
 */
export async function saveProductsToServer(products: Product[]): Promise<{ success: true } | { success: false; error: string }> {
  try {
    // Validate the incoming data against our schema.
    const validation = productsSchema.safeParse(products);
    if (!validation.success) {
      console.error('Invalid product data received:', validation.error);
      return { success: false, error: 'Los datos de los productos son inválidos.' };
    }

    // Path to the JSON file that acts as our database.
    const dbPath = path.join(process.cwd(), 'src', 'data', 'products.json');
    
    // Convert the product array to a formatted JSON string.
    const data = JSON.stringify(validation.data, null, 2);
    
    // Write the new data to the file, overwriting the old data.
    await fs.writeFile(dbPath, data, 'utf8');

    return { success: true };
  } catch (error) {
    console.error('Failed to save products to server:', error);
    return { success: false, error: 'No se pudo guardar los productos en el servidor.' };
  }
}


'use server';

import type { Product } from '@/lib/types';
import { products as productsTable } from '@/lib/db/schema';
import { db } from '@/lib/db/drizzle';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Saves a single product (either creating or updating) to the database.
 * @param {Product} product The product data to save.
 * @returns {Promise<{success: boolean; error?: string}>} An object indicating success or failure.
 */
export async function saveProduct(product: Product): Promise<{ success: boolean; error?: string }> {
  try {
    // Drizzle/node-postgres works more reliably when numeric types are passed as strings.
    // The incoming product object can have numbers, so we explicitly convert them here.
    const valuesToSave = {
        ...product,
        price: product.price, // Keep as number
        salePrice: product.isOnSale && product.salePrice != null ? product.salePrice : null, // Keep as number or set to null
    };
    
    // For updates, we explicitly exclude the 'id' from the 'set' object.
    const { id: _, ...updateData } = valuesToSave;

    // Use a single "upsert" operation.
    // It will INSERT if the ID doesn't exist, or UPDATE if it does.
    await db.insert(productsTable)
      .values(valuesToSave)
      .onConflictDoUpdate({
        target: productsTable.id,
        set: updateData,
      });

    // Revalidate paths to show updated data immediately
    revalidatePath('/admin');
    revalidatePath('/productos');
    revalidatePath('/');
    if (product.id) {
        revalidatePath(`/productos/${product.id}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to save product to database:', error);
    return { success: false, error: 'No se pudo guardar el producto en la base de datos.' };
  }
}


/**
 * Deletes a product from the database by its ID.
 * @param {number} productId The ID of the product to delete.
 * @returns {Promise<{success: boolean; error?: string}>} An object indicating success or failure.
 */
export async function deleteProduct(productId: number): Promise<{ success: boolean; error?: string }> {
  try {
    await db.delete(productsTable).where(eq(productsTable.id, productId));
    
    // Revalidate paths
    revalidatePath('/admin');
    revalidatePath('/productos');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete product from database:', error);
    return { success: false, error: 'No se pudo eliminar el producto de la base de datos.' };
  }
}

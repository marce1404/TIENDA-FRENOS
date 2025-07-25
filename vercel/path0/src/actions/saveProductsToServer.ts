
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
    // Drizzle's pg-core expects numeric types as strings when inserting/updating
    // The incoming product object from the form now sends numbers, so we convert them here.
    const valuesToSave = {
        ...product,
        price: String(product.price),
        salePrice: product.isOnSale && product.salePrice ? String(product.salePrice) : null,
    };
    
    // For updates, we explicitly exclude the 'id' from the 'set' object.
    const { id: _, ...updateData } = {
        ...valuesToSave
    };

    await db.insert(productsTable)
      .values({
        id: product.id,
        ...valuesToSave
      })
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

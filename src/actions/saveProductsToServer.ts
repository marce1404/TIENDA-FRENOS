
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
    // Drizzle's pg-core expects numeric types as strings when inserting/updating.
    // The incoming product object from the form should have price as a number.
    const valuesToSave = {
        ...product,
        price: String(product.price),
        salePrice: product.isOnSale && product.salePrice ? String(product.salePrice) : null,
    };

    // Exclude 'id' from the 'set' object for updates.
    const { id: _, ...updateData } = valuesToSave;

    if (product.id) {
        // If an ID exists, it's an update.
        await db.update(productsTable)
            .set(updateData)
            .where(eq(productsTable.id, product.id));
    } else {
        // If no ID, it's a new product. Drizzle will use the auto-incrementing serial.
        const { id: removeId, ...insertData } = valuesToSave;
        await db.insert(productsTable).values(insertData);
    }

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

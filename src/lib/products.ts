
'use server';

import type { Product } from '@/lib/types';
import { db } from './db/drizzle';
import { products } from './db/schema';
import { eq } from 'drizzle-orm';
import { unstable_noStore as noStore } from 'next/cache';
import { getEnvSettings } from './env';

/**
 * Mapea un producto crudo de la base de datos a un objeto Product completamente formado,
 * asegurando que tenga una URL de imagen válida.
 * @param {typeof products.$inferSelect} p El producto crudo de la base de datos.
 * @param {string | undefined} defaultPastillaUrl URL por defecto para pastillas.
 * @param {string | undefined} defaultDiscoUrl URL por defecto para discos.
 * @returns {Product} El producto procesado con una URL de imagen garantizada.
 */
function mapDbProductToAppProduct(
  p: typeof products.$inferSelect,
  defaultPastillaUrl: string | undefined,
  defaultDiscoUrl: string | undefined,
): Product {
  let imageUrl = p.imageUrl;
  
  if (!imageUrl || imageUrl.trim() === '') {
    if (p.category === 'Pastillas') {
        imageUrl = defaultPastillaUrl || null;
    } else if (p.category === 'Discos') {
        imageUrl = defaultDiscoUrl || null;
    }
  }
  
  return {
    ...p,
    price: Number(p.price),
    // Asegurar que salePrice sea null si no es un número positivo
    salePrice: p.salePrice != null && Number(p.salePrice) > 0 ? Number(p.salePrice) : null,
    isOnSale: p.isOnSale === true && p.salePrice != null && Number(p.salePrice) > 0,
    imageUrl: imageUrl, // Ahora puede ser una URL o null
  };
}

/**
 * Obtiene todos los productos de la base de datos y asigna imágenes por defecto si es necesario.
 * Usa noStore() para asegurar que los datos siempre sean frescos.
 * @returns {Promise<Product[]>} Una promesa que se resuelve en un array de productos.
 */
export async function getProducts(): Promise<Product[]> {
  noStore();
  
  try {
    const settings = await getEnvSettings();
    const dbProducts = await db.select().from(products);
    const processedProducts = dbProducts.map(p => 
        mapDbProductToAppProduct(p, settings.DEFAULT_PASTILLA_IMAGE_URL, settings.DEFAULT_DISCO_IMAGE_URL)
    );
    return processedProducts;
  } catch (error) {
    console.error("CRITICAL: La consulta a la base de datos para todos los productos falló.", error);
    return [];
  }
}

/**
 * Obtiene un único producto por su ID de la base de datos y le asigna una imagen por defecto si es necesario.
 * @param {number} id El ID del producto a obtener.
 * @returns {Promise<Product | null>} Una promesa que se resuelve en el producto o null si no se encuentra.
 */
export async function getProductById(id: number): Promise<Product | null> {
    noStore();
    try {
        const settings = await getEnvSettings();
        const result = await db.select().from(products).where(eq(products.id, id));
        if (result.length === 0) {
            return null;
        }
        const processedProduct = mapDbProductToAppProduct(result[0], settings.DEFAULT_PASTILLA_IMAGE_URL, settings.DEFAULT_DISCO_IMAGE_URL);
        return processedProduct;
    } catch (error) {
        console.error(`CRITICAL: La consulta a la base de datos para el producto ${id} falló.`, error);
        return null;
    }
}

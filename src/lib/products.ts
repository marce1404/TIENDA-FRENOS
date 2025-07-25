
'use server';

import type { Product } from '@/lib/types';
import { db } from './db/drizzle';
import { products } from './db/schema';
import { eq } from 'drizzle-orm';
import { unstable_noStore as noStore } from 'next/cache';

const DEFAULT_PASTILLA_IMAGE_URL = 'https://res.cloudinary.com/repufrenos/image/upload/v1716335805/repufrenos/defaults/default_pastilla.png';
const DEFAULT_DISCO_IMAGE_URL = 'https://res.cloudinary.com/repufrenos/image/upload/v1716335805/repufrenos/defaults/default_disco.png';

/**
 * Mapea un producto crudo de la base de datos a un objeto Product completamente formado,
 * asegurando que tenga una URL de imagen válida.
 * @param {typeof products.$inferSelect} p El producto crudo de la base de datos.
 * @returns {Product} El producto procesado con una URL de imagen garantizada.
 */
function mapDbProductToAppProduct(p: typeof products.$inferSelect): Product {
  let imageUrl = p.imageUrl;
  
  if (!imageUrl || imageUrl.trim() === '') {
    imageUrl = p.category === 'Pastillas' ? DEFAULT_PASTILLA_IMAGE_URL : DEFAULT_DISCO_IMAGE_URL;
  }
  
  return {
    ...p,
    price: Number(p.price),
    // Asegurar que salePrice sea null si no es un número positivo
    salePrice: p.salePrice != null && Number(p.salePrice) > 0 ? Number(p.salePrice) : null,
    isOnSale: p.isOnSale === true && p.salePrice != null && Number(p.salePrice) > 0,
    imageUrl: imageUrl, // Ahora garantizado como una URL válida
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
    const dbProducts = await db.select().from(products);
    const processedProducts = dbProducts.map(mapDbProductToAppProduct);
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
        const result = await db.select().from(products).where(eq(products.id, id));
        if (result.length === 0) {
            return null;
        }
        const processedProduct = mapDbProductToAppProduct(result[0]);
        return processedProduct;
    } catch (error) {
        console.error(`CRITICAL: La consulta a la base de datos para el producto ${id} falló.`, error);
        return null;
    }
}

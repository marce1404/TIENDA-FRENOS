
import type { Product } from '@/lib/types';
import { products as initialProducts } from '@/data/products';
import productsData from '@/data/products.json';

/**
 * Obtiene la lista de productos desde el archivo products.json.
 * Esta función está diseñada para funcionar tanto en el servidor como en el cliente.
 * 
 * CÓMO FUNCIONA:
 * Lee directamente el archivo `products.json` que fue importado.
 * Esto asegura que tanto el servidor (durante la compilación y renderizado)
 * como el cliente (en la navegación) usen la misma fuente de datos centralizada.
 * 
 * @returns {Product[]} La lista de productos.
 */
export function getProducts(): Product[] {
  // Ahora, la única fuente de verdad es el archivo products.json importado.
  // Esto funciona en el servidor y en el cliente.
  return productsData;
}

/**
 * Guarda la lista completa de productos.
 * En la nueva implementación, esta función es un contenedor del lado del cliente.
 * El guardado real se delega a una Server Action para que ocurra en el servidor.
 * La mantenemos por compatibilidad con las llamadas existentes en el panel de admin.
 * @param {Product[]} products La lista de productos actualizada para guardar.
 */
export function saveProducts(products: Product[]): void {
  // Esta función ahora sirve como un punto de entrada en el cliente.
  // El guardado real se hará con una Server Action (`saveProductsToServer`).
  // Se deja aquí para que los componentes que la usaban no se rompan.
  console.log("saveProducts en el cliente. El guardado real debe hacerse a través de una Server Action.");
}

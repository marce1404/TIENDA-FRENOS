
'use client';

import { products as initialProducts } from '@/data/products';
import type { Product } from '@/lib/types';

/**
 * Obtiene la lista de productos.
 * Esta aplicación utiliza el localStorage del navegador como una base de datos simple.
 * 
 * CÓMO FUNCIONA:
 * 1. Lado del Servidor (Durante la compilación): Como no hay localStorage,
 *    devuelve la lista de productos inicial desde `src/data/products.ts`.
 * 2. Lado del Cliente (Navegador):
 *    - Intenta leer los productos guardados en localStorage con la clave 'products'.
 *    - Si existen y son válidos, los devuelve.
 *    - Si no existen (o es la primera visita), usa la lista inicial, la guarda en
 *      localStorage para futuras visitas y luego la devuelve.
 * 
 * @returns {Product[]} La lista de productos.
 */
export function getProducts(): Product[] {
  // Si estamos en el servidor, no hay localStorage. Devolvemos la lista inicial.
  if (typeof window === 'undefined') {
    return initialProducts;
  }
  
  // Lógica del lado del cliente usando localStorage.
  try {
    const savedProductsJSON = localStorage.getItem('products');
    
    if (savedProductsJSON) {
        const productsFromStorage = JSON.parse(savedProductsJSON);
        // Asegurarse de que es un array válido antes de devolverlo.
        if (Array.isArray(productsFromStorage)) {
            return productsFromStorage;
        }
    }

    // Si localStorage está vacío, es inválido o no contiene un array,
    // se inicializa con la lista por defecto, se guarda y se devuelve.
    localStorage.setItem('products', JSON.stringify(initialProducts));
    return initialProducts;

  } catch (e) {
    // Si ocurre cualquier otro error (ej. al parsear el JSON),
    // se devuelve la lista inicial para evitar que la app se rompa.
    console.error('Error al leer productos desde localStorage, usando datos iniciales.', e);
    try {
        localStorage.setItem('products', JSON.stringify(initialProducts));
    } catch (saveError) {
        console.error('No se pudo guardar la lista inicial en localStorage.', saveError);
    }
    return initialProducts;
  }
}

/**
 * Guarda la lista completa de productos en el localStorage del navegador.
 * Esta función debe ser llamada solo desde el lado del cliente (ej. desde el panel de admin).
 * @param {Product[]} products La lista de productos actualizada para guardar.
 */
export function saveProducts(products: Product[]): void {
  if (typeof window === 'undefined') {
    console.warn('saveProducts fue llamada en el servidor. Los datos no se persistirán.');
    return;
  }
  try {
    localStorage.setItem('products', JSON.stringify(products));
  } catch(e) {
    console.error('No se pudo guardar los productos en localStorage.', e);
  }
}

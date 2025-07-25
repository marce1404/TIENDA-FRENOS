
import { getProducts } from '@/lib/products';
import { ProductBrowser } from './ProductBrowser';
import type { Product } from '@/lib/types';

// Esto fuerza a Vercel a tratar esta página como dinámica, ignorando el caché estático.
// La lectura de esta variable de entorno no existente invalida el caché.
export const dynamic = 'force-dynamic';
const cacheBuster = process.env.CACHE_BUSTER;


// Este es ahora un Componente de Servidor puro.
export default async function ProductosPage() {
  const initialProducts: Product[] = await getProducts();

  // Pasa los datos iniciales como prop a un componente de cliente.
  return <ProductBrowser initialProducts={initialProducts} />;
}

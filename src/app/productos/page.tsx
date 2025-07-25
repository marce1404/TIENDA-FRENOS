
import { getProducts } from '@/lib/products';
import { ProductClientPage } from './ProductClientPage';
import type { Product } from '@/lib/types';

// This is now a Server Component. It fetches data once on the server.
export default async function ProductosPage() {
  const initialProducts: Product[] = await getProducts();

  // It then passes the initial data to a Client Component.
  return <ProductClientPage initialProducts={initialProducts} />;
}

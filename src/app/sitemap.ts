
import { MetadataRoute } from 'next';
import { getProducts } from '@/lib/products';

export default function sitemap(): MetadataRoute.Sitemap {
  const products = getProducts();
  const baseUrl = 'https://repufrenos.cl';

  const productEntries: MetadataRoute.Sitemap = products.map(({ id }) => ({
    url: `${baseUrl}/productos/${id}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/productos`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
    },
    ...productEntries,
  ];
}

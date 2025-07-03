
'use client';

import { useState, useMemo, useEffect } from 'react';
import { getProducts } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons';

export default function ProductosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setAllProducts(getProducts());
    setIsMounted(true);
  }, []);

  const categories = useMemo(() => [...new Set(allProducts.map((p) => p.category))], [allProducts]);

  const products = useMemo(() => {
    if (!isMounted) return [];
    
    let filteredProducts: Product[] = [...allProducts];

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(lowercasedTerm) ||
          p.brand.toLowerCase().includes(lowercasedTerm) ||
          p.model.toLowerCase().includes(lowercasedTerm) ||
          p.compatibility.toLowerCase().includes(lowercasedTerm)
      );
    }

    if (selectedCategory !== 'all') {
      filteredProducts = filteredProducts.filter((p) =>
        p.category === selectedCategory
      );
    }
    
    // Sort products alphabetically by name by default
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));

    // Separate featured and non-featured
    
    
    // Reset to first page when filters change
    setCurrentPage(1);


    return filteredProducts;
  }, [searchTerm, selectedCategory, allProducts, isMounted]);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const featuredProducts = useMemo(() => products.filter(p => p.isFeatured), [products]);
  const nonFeaturedProducts = useMemo(() => products.filter(p => !p.isFeatured), [products]);
  const LoadingSkeleton = () => (
    // Adjust skeleton for mixed layout if needed, for now keep simple
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );

  const paginatedProducts = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return products.slice(startIndex, startIndex + itemsPerPage);
  }, [products, currentPage, itemsPerPage]); // This now applies to all products, need to adjust for non-featured
   return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Nuestros Productos</h1>
          <p className="text-muted-foreground">
            Encuentra los mejores repuestos de frenos para tu vehículo.
          </p>
        </div>

        <div className="relative mb-6">
          <Input
            placeholder="Buscar por producto, marca, modelo o compatibilidad..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!isMounted}
          />
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        </div>
        
        <div className="mb-8 flex justify-center">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
              <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  {isMounted ? categories.map((category) => (
                      <TabsTrigger key={category} value={category}>
                          {category}
                      </TabsTrigger>
                  )) : (
                    <>
                      <Skeleton className="h-10 w-20 rounded-md" />
                      <Skeleton className="h-10 w-20 rounded-md" />
                      <Skeleton className="h-10 w-20 rounded-md" />
                    </>
                  )}
              </TabsList>
          </Tabs>
        </div>

        {!isMounted ? <LoadingSkeleton /> : (
          <div className="flex flex-col gap-12">

            {/* Featured Products Section */}
            {featuredProducts.length > 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold border-b pb-2">Productos Destacados</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {featuredProducts.map((product) => (
                     // Use ProductCard component, adjust styling via props or global CSS if needed for smaller size
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Non-Featured Products Section */}
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold border-b pb-2">Todos los Productos</h2>
                {nonFeaturedProducts.length > 0 ? (
                  <>
                    {nonFeaturedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((product) => (
                      // List item display
                      <div key={product.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <Link href={`/productos/${product.id}`} className="flex-grow">
                            <h2 className="text-lg font-semibold">{product.name}</h2>
                            <p className="text-sm text-muted-foreground">{product.brand} | {product.model}</p>
                            {product.compatibility && (
                               <p className="text-xs text-muted-foreground mt-1">Compatibilidad: {product.compatibility}</p>
                            )}
                        </Link>
                        <div className="flex flex-col items-start sm:items-end gap-2">
                            <p className="text-lg font-bold">
                                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(product.price)}
                            </p>
                             <Link href={`/productos/${product.id}`}>
                               <Button variant="outline" size="sm">Ver Detalles</Button>
                            </Link>
                        </div>
                      </div>
                    ))}
                     {/* Pagination Controls for Non-Featured */}
                     {nonFeaturedProducts.length > itemsPerPage && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Anterior
                            </Button>
                            <span className="text-muted-foreground">
                                Página {currentPage} de {Math.ceil(nonFeaturedProducts.length / itemsPerPage)}
                            </span>
                            <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => setCurrentPage(prev => Math.min(Math.ceil(nonFeaturedProducts.length / itemsPerPage), prev + 1))}
                                 disabled={currentPage === Math.ceil(nonFeaturedProducts.length / itemsPerPage)}
                            >
                                Siguiente
                                 <ArrowRightIcon className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    )}
                  </>
                ) : (
                   <p className="col-span-full text-center text-muted-foreground">No se encontraron productos que coincidan con tu búsqueda.</p>
                )}


                    </div>
          </div>
        )}

      </div>
  );
}




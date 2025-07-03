
'use client';

import { useState, useMemo, useEffect } from 'react';
import { getProducts } from '@/lib/products';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import { useCart } from '@/hooks/use-cart';

export default function ProductosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    setAllProducts(getProducts());
    setIsMounted(true);
  }, []);

  const categories = useMemo(() => {
    // Derive categories only from the current set of products to avoid stale data.
    return [...new Set(allProducts.map((p) => p.category))];
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    if (!isMounted) return [];
    
    let products: Product[] = [...allProducts];

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(lowercasedTerm) ||
          p.brand.toLowerCase().includes(lowercasedTerm) ||
          p.model.toLowerCase().includes(lowercasedTerm) ||
          p.compatibility.toLowerCase().includes(lowercasedTerm)
      );
    }

    if (selectedCategory !== 'all') {
      products = products.filter((p) =>
        p.category === selectedCategory
      );
    }
    
    products.sort((a, b) => a.name.localeCompare(b.name));

    return products;
  }, [searchTerm, selectedCategory, allProducts, isMounted]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const paginatedProducts = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const LoadingSkeleton = () => (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
         <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );

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
                    </>
                  )}
              </TabsList>
          </Tabs>
        </div>

        {!isMounted ? <LoadingSkeleton /> : (
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold border-b pb-2">Resultados de la Búsqueda</h2>
                {paginatedProducts.length > 0 ? (
                  <>
                    {paginatedProducts.map((product) => (
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
                             <Button size="sm" onClick={(e) => { e.preventDefault(); addToCart(product); }}>
                                <ShoppingCart className="mr-2 h-4 w-4"/>
                                Añadir
                             </Button>
                        </div>
                      </div>
                    ))}
                     {totalPages > 1 && (
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
                                Página {currentPage} de {totalPages}
                            </span>
                            <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                 disabled={currentPage === totalPages}
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

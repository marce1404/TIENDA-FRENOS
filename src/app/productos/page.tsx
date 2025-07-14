
'use client';

import { useState, useMemo, useEffect } from 'react';
import { getProducts } from '@/lib/products';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ProductosPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    // Carga los productos de forma segura en el lado del cliente
    setAllProducts(getProducts());
    setIsLoading(false);
  }, []);

  const categories = useMemo(() => {
    if (allProducts.length === 0) return [];
    const uniqueCategories = [...new Set(allProducts.map(p => p.category))];
    return uniqueCategories.sort();
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(lowercasedTerm) ||
          p.brand.toLowerCase().includes(lowercasedTerm) ||
          p.model.toLowerCase().includes(lowercasedTerm) ||
          (p.code && p.code.toLowerCase().includes(lowercasedTerm)) ||
          p.compatibility.toLowerCase().includes(lowercasedTerm)
      );
    }

    if (selectedCategory !== 'all') {
      products = products.filter((p) => p.category === selectedCategory);
    }
    
    products.sort((a, b) => a.name.localeCompare(b.name));

    return products;
  }, [searchTerm, selectedCategory, allProducts]);

  useEffect(() => {
    // Resetea a la primera página cuando cambian los filtros
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const paginatedProducts = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };
  
  const handleRowClick = (productId: number) => {
    router.push(`/productos/${productId}`);
  };

  const LoadingSkeleton = () => (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Compatibilidad</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="w-[120px] text-center">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: itemsPerPage }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-48" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-64" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-9 w-24 mx-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

   return (
      <div className="container mx-auto p-6">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold">Nuestros Productos</h1>
          <p className="mt-2 text-muted-foreground">
            Encuentra los mejores repuestos de frenos para tu vehículo.
          </p>
        </div>

        <div className="relative mb-6 max-w-lg mx-auto">
          <Input
            placeholder="Buscar por código, producto, marca, modelo..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        </div>
        
        <div className="mb-8 flex justify-center">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
              <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  {isLoading ? (
                    <>
                      <Skeleton className="h-10 w-20 rounded-md" />
                      <Skeleton className="h-10 w-20 rounded-md" />
                    </>
                  ) : (
                    categories.map((category) => (
                      <TabsTrigger key={category} value={category}>
                          {category}
                      </TabsTrigger>
                  )))}
              </TabsList>
          </Tabs>
        </div>
        
        {isLoading ? <LoadingSkeleton /> : (
          paginatedProducts.length > 0 ? (
            <>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Compatibilidad</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="w-[120px] text-center">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((product) => (
                      <TableRow 
                        key={product.id}
                        onClick={() => handleRowClick(product.id)}
                        className="cursor-pointer"
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{product.name}</span>
                            <span className="text-xs text-muted-foreground">{product.code}</span>
                          </div>
                        </TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell>{product.compatibility}</TableCell>
                        <TableCell className="text-right">{formatPrice(product.price)}</TableCell>
                        <TableCell className="text-center">
                          <Button 
                            size="sm" 
                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                            aria-label={`Añadir ${product.name} al carrito`}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Añadir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
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
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-10">
              <p>No se encontraron productos que coincidan con tu búsqueda.</p>
            </div>
          )
        )}
      </div>
  );
}

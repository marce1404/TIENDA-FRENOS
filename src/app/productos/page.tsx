
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { Badge } from '@/components/ui/badge';
import { BrakePadIcon } from '@/components/icons/BrakePadIcon';
import { BrakeDiscIcon } from '@/components/icons/BrakeDiscIcon';


export default function ProductosPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const [whatsappNumber, setWhatsappNumber] = useState('56912345678');

  useEffect(() => {
    async function fetchProducts() {
      const dbProducts = await getProducts();
      setAllProducts(dbProducts);
      setIsLoading(false);
    }

    fetchProducts();

    const getWhatsappNumber = () => {
        let loadedNumber = '56912345678';
        const savedInfo = localStorage.getItem('whatsappInfo');
        if (savedInfo) {
            try {
                const { number } = JSON.parse(savedInfo);
                if (number) loadedNumber = number;
            } catch (e) {}
        }
        setWhatsappNumber(loadedNumber);
    };

    getWhatsappNumber();
  }, []);
  
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(allProducts.map(p => p.category))];
    return uniqueCategories.sort();
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let products = allProducts;

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
    
    return products.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm, selectedCategory, allProducts]);

  useEffect(() => {
    // Reset to the first page when filters change
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
  
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddToCartClick = (product: Product) => {
    addToCart(product);
    setSelectedProduct(null); // Cerrar el diálogo después de añadir al carrito
  };
  
  const handleContactClick = (product: Product) => {
    const message = `¡Hola! Tengo una duda sobre el producto "${product.name}" (código: ${product.code}).`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const LoadingSkeleton = () => (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Modelo</TableHead>
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
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
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
            disabled={isLoading}
          />
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        </div>
        
        <div className="mb-8 flex justify-center">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
              <TabsList>
                  <TabsTrigger value="all" disabled={isLoading}>Todos</TabsTrigger>
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
          filteredProducts.length > 0 ? (
            <>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Código</TableHead>
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
                        onClick={() => handleProductClick(product)}
                        className="cursor-pointer"
                      >
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.code}</TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell>{product.compatibility}</TableCell>
                        <TableCell className="text-right">
                          {product.isOnSale && typeof product.salePrice === 'number' && product.salePrice > 0 ? (
                            <div className="flex flex-col items-end">
                              <span className="line-through text-muted-foreground text-xs">{formatPrice(product.price)}</span>
                              <span className="text-primary font-bold">{formatPrice(product.salePrice)}</span>
                            </div>
                          ) : (
                            formatPrice(product.price)
                          )}
                        </TableCell>
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
        
        {/* Diálogo de Detalle del Producto */}
        {selectedProduct && (
          <Dialog open={!!selectedProduct} onOpenChange={(isOpen) => !isOpen && setSelectedProduct(null)}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProduct.name}</DialogTitle>
                {selectedProduct.isOnSale && <Badge className="absolute top-4 right-16 bg-red-600 text-yellow-300 border-red-700">OFERTA</Badge>}
              </DialogHeader>
               <div className="grid md:grid-cols-2 gap-8 py-4">
                <div className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                    {selectedProduct.imageUrl ? (
                        <Image
                            src={selectedProduct.imageUrl}
                            alt={`Imagen de ${selectedProduct.name}`}
                            fill
                            className="object-contain"
                            data-ai-hint={selectedProduct.category === 'Pastillas' ? 'brake pad' : 'brake disc'}
                        />
                    ) : (
                         selectedProduct.category === 'Pastillas' ? (
                            <BrakePadIcon className="w-48 h-48 text-muted-foreground m-auto" />
                        ) : (
                            <BrakeDiscIcon className="w-48 h-48 text-muted-foreground m-auto" />
                        )
                    )}
                </div>
                <div className="flex flex-col space-y-4">
                  <div>
                    {selectedProduct.isOnSale && typeof selectedProduct.salePrice === 'number' && selectedProduct.salePrice > 0 ? (
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-primary">{formatPrice(selectedProduct.salePrice)}</p>
                        <p className="text-xl font-medium text-muted-foreground line-through">{formatPrice(selectedProduct.price)}</p>
                      </div>
                    ) : (
                      <p className="text-3xl font-bold text-primary">{formatPrice(selectedProduct.price)}</p>
                    )}
                  </div>
                  <Separator />
                  <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                    <span className="font-semibold text-foreground">Código:</span>
                    <span className="font-mono text-base text-foreground">{selectedProduct.code}</span>
                  
                    <span className="font-semibold text-foreground">Marca:</span>
                    <span className="text-muted-foreground">{selectedProduct.brand}</span>

                    <span className="font-semibold text-foreground">Modelo:</span>
                    <span className="text-muted-foreground">{selectedProduct.model}</span>

                    <span className="font-semibold text-foreground">Categoría:</span>
                    <span className="text-muted-foreground">{selectedProduct.category}</span>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-foreground">Compatibilidad</h3>
                    <p className="text-sm text-muted-foreground">{selectedProduct.compatibility}</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-2">
                   <Button type="button" variant="outline" onClick={() => setSelectedProduct(null)}>Cerrar</Button>
                   <Button 
                      type="button"
                      variant="outline"
                      className="bg-green-500 hover:bg-green-600 text-white hover:text-white"
                      onClick={() => handleContactClick(selectedProduct)}
                    >
                      <WhatsAppIcon className="h-5 w-5 mr-2" />
                      Si tienes dudas, ¡Contáctanos!
                   </Button>
                </div>
                <Button type="button" onClick={() => handleAddToCartClick(selectedProduct)}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Añadir al Carrito
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
  );
}

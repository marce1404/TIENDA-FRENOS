
'use client';

import { useState, useMemo, useEffect } from 'react';
import { getProducts } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Header } from '@/components/Header';
import { Search } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('price-asc');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setAllProducts(getProducts());
    setIsMounted(true);
  }, []);

  const categories = useMemo(() => [...new Set(allProducts.map((p) => p.category))], [allProducts]);
  const brands = useMemo(() => [...new Set(allProducts.map((p) => p.brand))], [allProducts]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, category] : prev.filter((c) => c !== category)
    );
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    setSelectedBrands((prev) =>
      checked ? [...prev, brand] : prev.filter((b) => b !== brand)
    );
  };

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

    if (selectedCategories.length > 0) {
      filteredProducts = filteredProducts.filter((p) =>
        selectedCategories.includes(p.category)
      );
    }

    if (selectedBrands.length > 0) {
      filteredProducts = filteredProducts.filter((p) =>
        selectedBrands.includes(p.brand)
      );
    }

    switch (sortOrder) {
      case 'price-asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filteredProducts;
  }, [searchTerm, sortOrder, selectedCategories, selectedBrands, allProducts, isMounted]);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1">
          <Sidebar side="left" collapsible="icon" variant="sidebar">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Filtros</SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Ordenar por</h3>
                      <RadioGroup
                        value={sortOrder}
                        onValueChange={setSortOrder}
                        disabled={!isMounted}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="price-asc" id="price-asc" />
                          <Label htmlFor="price-asc" className="font-normal">
                            Precio: Menor a Mayor
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="price-desc" id="price-desc" />
                          <Label htmlFor="price-desc" className="font-normal">
                            Precio: Mayor a Menor
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="name-asc" id="name-asc" />
                          <Label htmlFor="name-asc" className="font-normal">
                            Nombre: A-Z
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-2">Categoría</h3>
                      <div className="space-y-2">
                        {isMounted ? categories.map((category) => (
                          <div
                            key={category}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`cat-${category}`}
                              onCheckedChange={(checked) =>
                                handleCategoryChange(category, !!checked)
                              }
                              checked={selectedCategories.includes(category)}
                            />
                            <Label
                              htmlFor={`cat-${category}`}
                              className="font-normal"
                            >
                              {category}
                            </Label>
                          </div>
                        )) : Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-6 w-3/4" />)}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-2">Marca</h3>
                      <div className="space-y-2">
                         {isMounted ? brands.map((brand) => (
                          <div
                            key={brand}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`brand-${brand}`}
                              onCheckedChange={(checked) =>
                                handleBrandChange(brand, !!checked)
                              }
                              checked={selectedBrands.includes(brand)}
                            />
                            <Label
                              htmlFor={`brand-${brand}`}
                              className="font-normal"
                            >
                              {brand}
                            </Label>
                          </div>
                        )) : Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-6 w-3/4" />)}
                      </div>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <SidebarInset>
            <main className="flex-1 p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold">Nuestros Productos</h1>
                <p className="text-muted-foreground">
                  Encuentra los mejores repuestos de frenos para tu vehículo.
                </p>
              </div>

              <div className="mb-6 relative">
                <Input
                  placeholder="Buscar por producto, marca, modelo o compatibilidad..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={!isMounted}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
              
              {!isMounted ? <LoadingSkeleton /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.length > 0 ? (
                    products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  ) : (
                     <p className="col-span-full text-center text-muted-foreground">No se encontraron productos que coincidan con tu búsqueda.</p>
                  )}
                </div>
              )}

            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}

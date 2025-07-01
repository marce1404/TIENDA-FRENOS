
import { products } from '@/data/products';
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
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function Home() {
  const categories = [...new Set(products.map((p) => p.category))];
  const brands = [...new Set(products.map((p) => p.brand))];

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
                      <RadioGroup defaultValue="price-asc">
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
                        {categories.map((category) => (
                          <div
                            key={category}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox id={`cat-${category}`} />
                            <Label
                              htmlFor={`cat-${category}`}
                              className="font-normal"
                            >
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-2">Marca</h3>
                      <div className="space-y-2">
                        {brands.map((brand) => (
                          <div
                            key={brand}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox id={`brand-${brand}`} />
                            <Label
                              htmlFor={`brand-${brand}`}
                              className="font-normal"
                            >
                              {brand}
                            </Label>
                          </div>
                        ))}
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
                  placeholder="Buscar por producto, marca o compatibilidad..."
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}

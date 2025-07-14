
'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Users, Truck, Medal, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/products';
import { FeaturedProductCard } from '@/components/FeaturedProductCard';
import type { Product } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(price);
};


export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const allProducts = getProducts();
    setFeaturedProducts(allProducts.filter((product) => product.isFeatured));
    setIsMounted(true);
  }, []);

  const features = [
    {
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      title: 'Calidad Garantizada',
      description: 'Solo trabajamos con las mejores marcas y materiales para asegurar tu seguridad y rendimiento.',
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: 'Asesoramiento Experto en Frenos',
      description: 'Nuestro equipo de especialistas está listo para ayudarte a encontrar el componente exacto que tu vehículo necesita.',
    },
    {
      icon: <Truck className="h-10 w-10 text-primary" />,
      title: 'Opciones Flexibles de Entrega',
      description: 'Recibe tus repuestos a domicilio, retíralos en nuestro local de Conchalí o en nuestros puntos de entrega tanto en Conchalí como en Recoleta.',
    },
  ];

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddToCartClick = (product: Product) => {
    addToCart(product);
    setSelectedProduct(null); // Cerrar el diálogo después de añadir al carrito
  };

  return (
    <>
      <section className="container mx-auto px-4 py-12 md:py-20 text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary">REPUFRENOS.CL</h1>
          <p className="text-2xl md:text-3xl font-semibold mt-2">Tus Especialistas en Sistemas de Frenos</p>
        </div>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 drop-shadow-md">
          Encuentra la calidad que buscas al precio que necesitas. Ofrecemos una amplia gama de repuestos de frenos para ajustarnos a tu presupuesto sin comprometer tu seguridad.
        </p>
        <Link href="/productos">
          <Button size="lg">Ver Productos</Button>
        </Link>
      </section>
      <section className="bg-card/50">
          <div className="container mx-auto px-4 py-16 md:py-24">
              <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Productos Destacados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {isMounted && featuredProducts.map((product) => (
                      <FeaturedProductCard
                        key={product.id}
                        product={product}
                        onProductClick={handleProductClick}
                      />
                  ))}
              </div>
          </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">¿Por Qué Elegirnos?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card/50">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <Card className="bg-card border-border shadow-lg">
              <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                  <Medal className="h-16 w-16 text-primary flex-shrink-0" />
                  <div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-4">Más de 15 Años de Experiencia Dedicados a Frenos</h3>
                      <p className="text-muted-foreground">
                          Con más de una década y media en el mercado, hemos forjado una trayectoria basada en la confianza y el conocimiento profundo del sistema de frenos. Esta experiencia nos permite asesorarte con precisión y ofrecerte solo productos de la más alta calidad, garantizando tu seguridad en cada kilómetro.
                      </p>
                  </div>
              </CardContent>
          </Card>
        </div>
      </section>

      {/* Diálogo de Detalle del Producto */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={(isOpen) => !isOpen && setSelectedProduct(null)}>
          <DialogContent className="sm:max-w-lg p-0">
            <DialogHeader className="p-6 pb-0 text-left">
              <DialogTitle className="text-2xl">{selectedProduct.name}</DialogTitle>
              <p className="text-sm text-muted-foreground pt-1">{selectedProduct.code}</p>
            </DialogHeader>
            <div className="py-4 px-6">
              <div className="flex flex-col gap-4">
                <p className="text-3xl font-bold text-primary">{formatPrice(selectedProduct.price)}</p>
                <Separator />
                <div className="space-y-4 text-muted-foreground">
                  <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2">
                    <span className="font-semibold text-foreground">Marca:</span>
                    <span>{selectedProduct.brand}</span>

                    <span className="font-semibold text-foreground">Modelo:</span>
                    <span>{selectedProduct.model}</span>

                    <span className="font-semibold text-foreground">Categoría:</span>
                    <span>{selectedProduct.category}</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground">Compatibilidad</h2>
                  <p className="text-muted-foreground">{selectedProduct.compatibility}</p>
                </div>
              </div>
            </div>
            <DialogFooter className="sm:justify-between gap-2 sm:gap-0 p-6 pt-0">
                <Button type="button" variant="outline" onClick={() => setSelectedProduct(null)}>Cerrar</Button>
                <Button type="button" size="lg" onClick={() => handleAddToCartClick(selectedProduct)}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Añadir al Carrito
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

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
import Image from 'next/image';
import { useDefaultImages } from '@/hooks/use-default-images';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(price);
};


export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const { defaultPastillaImage, defaultDiscoImage } = useDefaultImages();
  const [whatsappNumber, setWhatsappNumber] = useState('56912345678');
  const [promoProducts, setPromoProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadClientData = () => {
      const allProducts = getProducts();
      setPromoProducts(allProducts.filter((product) => product.isFeatured || product.isOnSale));
      
      let loadedNumber = '56912345678';
      const savedInfo = localStorage.getItem('whatsappInfo');
      if (savedInfo) {
          try {
              const { number } = JSON.parse(savedInfo);
              if (number) loadedNumber = number;
          } catch (e) {}
      }
      setWhatsappNumber(loadedNumber);
      setIsLoading(false);
    };

    loadClientData();
    
    const handleStorage = () => {
        loadClientData();
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
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

  const getProductImage = (product: Product) => {
    if (product.imageUrl) return product.imageUrl;
    if (product.category === 'Pastillas') return defaultPastillaImage;
    if (product.category === 'Discos') return defaultDiscoImage;
    return null;
  };
  
  const handleContactClick = (product: Product) => {
    const message = `¡Hola! Tengo una duda sobre el producto "${product.name}" (código: ${product.code}).`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
              <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Productos Destacados y Ofertas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="flex flex-col overflow-hidden h-full">
                        <CardContent className="p-4 space-y-4">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <div className="flex justify-between items-center pt-4">
                             <Skeleton className="h-8 w-1/3" />
                             <Skeleton className="h-9 w-1/3" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    promoProducts.map((product) => (
                        <FeaturedProductCard
                          key={product.id}
                          product={product}
                          onProductClick={handleProductClick}
                        />
                    ))
                  )}
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
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedProduct.name}</DialogTitle>
               {selectedProduct.isOnSale && <Badge className="absolute top-4 right-16 bg-red-600 text-yellow-300 border-red-700">OFERTA</Badge>}
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-8 py-4">
                <div className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden">
                    {getProductImage(selectedProduct) ? (
                        <Image
                            src={getProductImage(selectedProduct)!}
                            alt={`Imagen de ${selectedProduct.name}`}
                            fill
                            className="object-contain"
                            data-ai-hint={selectedProduct.category === 'Pastillas' ? 'brake pad' : 'brake disc'}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            Sin imagen
                        </div>
                    )}
                </div>
                <div className="flex flex-col space-y-4">
                   <div>
                    {selectedProduct.isOnSale && typeof selectedProduct.salePrice === 'number' ? (
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
    </>
  );
}

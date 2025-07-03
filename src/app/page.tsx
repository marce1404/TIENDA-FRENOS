'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Users, Truck, Medal } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/lib/types';

export default function HomePage() {
  const [homeImageUrl, setHomeImageUrl] = useState('https://placehold.co/600x400.png');
  const [isMounted, setIsMounted] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const savedUrl = localStorage.getItem('homeImageUrl');
    if (savedUrl) {
      setHomeImageUrl(savedUrl);
    }
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
      title: 'Asesoramiento Experto',
      description: 'Nuestro equipo está listo para ayudarte a encontrar el repuesto exacto para tu vehículo.',
    },
    {
      icon: <Truck className="h-10 w-10 text-primary" />,
      title: 'Envío y Retiro en Local',
      description: 'Recibe tus repuestos a domicilio o retíralos directamente en nuestra tienda.',
    },
  ];

  return (
    <>
      <section className="container mx-auto px-4 py-12 md:py-20 text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">casafrenos.cl</h1>
          <p className="text-2xl md:text-3xl text-primary font-medium mt-2">La casa del freno</p>
        </div>
        <div className="max-w-xl mx-auto mb-8">
          {isMounted && (
            <Image
              src={homeImageUrl}
              alt="Mecánico instalando frenos de alto rendimiento"
              width={600}
              height={400}
              className="rounded-lg shadow-xl mx-auto"
              data-ai-hint="brake repair"
              priority
            />
          )}
        </div>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Discos y pastillas de freno de alto rendimiento para todas las marcas. Seguridad y confianza en cada kilómetro.
        </p>
        <Link href="/productos">
          <Button size="lg">Ver Productos</Button>
        </Link>
      </section>

      <section className="bg-card/50">
          <div className="container mx-auto px-4 py-16 md:py-24">
              <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Productos Destacados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
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
                      <h3 className="text-2xl md:text-3xl font-bold mb-4">Más de 15 Años de Experiencia a tu Servicio</h3>
                      <p className="text-muted-foreground">
                          Con más de una década y media en el mercado, hemos forjado una trayectoria basada en la confianza y el conocimiento profundo del sistema de frenos. Esta experiencia nos permite asesorarte con precisión y ofrecerte solo productos de la más alta calidad, garantizando tu seguridad en cada kilómetro.
                      </p>
                  </div>
              </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

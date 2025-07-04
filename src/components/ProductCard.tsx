
'use client';

import type { Product } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from './ui/card';
import { useCart } from '@/hooks/use-cart';
import { Star } from 'lucide-react';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

  const dataAiHint = product.category === 'Pastillas' ? 'brake pad' : 'brake disc';

  return (
    <Card className="group flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
      <div className="relative bg-muted overflow-hidden">
        <Image
          src={product.imageUrl || 'https://placehold.co/400x300.png'}
          alt={product.name}
          width={400}
          height={300}
          className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint={dataAiHint}
        />
        {product.isFeatured && (
          <div className="absolute top-2 right-2 z-10 rounded-full bg-background/70 p-1.5 backdrop-blur-sm">
            <Star className="h-4 w-4 fill-primary text-primary" />
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-grow space-y-2">
        <CardTitle className="text-base font-bold leading-tight h-10">{product.name}</CardTitle>
        <div className="text-xs text-muted-foreground">
          <p>Marca: {product.brand}</p>
          <p>Modelo: {product.model}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
         <p className="text-lg font-semibold text-foreground">{formatPrice(product.price)}</p>
         <Button size="sm" onClick={() => addToCart(product)}>Añadir</Button>
      </CardFooter>
    </Card>
  );
}

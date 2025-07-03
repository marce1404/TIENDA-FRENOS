'use client';

import type { Product } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from './ui/card';
import { useCart } from '@/hooks/use-cart';
import { Star } from 'lucide-react';

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

  return (
    <Card className="relative flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
      {product.isFeatured && (
        <div className="absolute top-2 right-2 z-10">
          <Star className="h-5 w-5 fill-muted-foreground text-muted-foreground" />
        </div>
      )}
      <CardContent className="p-4 flex-grow space-y-2">
        <CardTitle className="text-base font-bold leading-tight">{product.name}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Marca: {product.brand}
        </CardDescription>
        <CardDescription className="text-xs text-muted-foreground">
          Modelo: {product.model}
        </CardDescription>
        <CardDescription className="text-xs text-muted-foreground">
          Compatibilidad: {product.compatibility}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
         <p className="text-lg font-semibold text-foreground">{formatPrice(product.price)}</p>
         <Button size="sm" onClick={() => addToCart(product)}>Añadir</Button>
      </CardFooter>
    </Card>
  );
}

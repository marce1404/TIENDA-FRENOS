
'use client';

import type { Product } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardTitle } from './ui/card';
import { useCart } from '@/hooks/use-cart';
import { Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  showFavorite?: boolean;
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
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-grow flex-col p-4">
        <div className="mb-4 flex min-h-[40px] items-start justify-between gap-2">
          <CardTitle className="text-base font-bold leading-tight">
            {product.name}
          </CardTitle>
          {product.isFeatured && (
            <Star className="h-5 w-5 flex-shrink-0 fill-primary text-primary" />
          )}
        </div>
        <div className="flex-grow space-y-1 text-sm text-muted-foreground">
          <p>Marca: {product.brand}</p>
          <p>Modelo: {product.model}</p>
          <p>Compatibilidad: {product.compatibility}</p>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <p className="text-lg font-semibold text-foreground">
          {formatPrice(product.price)}
        </p>
        <Button size="sm" onClick={() => addToCart(product)}>
          Añadir
        </Button>
      </CardFooter>
    </Card>
  );
}

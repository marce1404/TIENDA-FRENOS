'use client';

import type { Product } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
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
    <Card className="flex h-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
      <CardHeader className="relative p-4">
          <CardTitle className="text-base font-bold leading-tight pr-8">
              {product.name}
          </CardTitle>
          {product.isFeatured && (
              <div className="absolute top-3 right-3">
                  <Star className="h-5 w-5 flex-shrink-0 fill-gray-400 text-gray-400" />
              </div>
          )}
      </CardHeader>
      <CardContent className="flex flex-grow flex-col px-4 pb-4">
        <div className="flex-grow space-y-1 text-sm text-muted-foreground">
          <p><span className="font-semibold">Marca:</span> {product.brand}</p>
          <p><span className="font-semibold">Modelo:</span> {product.model}</p>
          <p><span className="font-semibold">Compatibilidad:</span> {product.compatibility}</p>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between px-4 pb-4 pt-0 pr-2">
        <p className="text-lg font-semibold text-foreground">
          {formatPrice(product.price)}
        </p>
        <Button size="sm" onClick={() => addToCart(product)}>Añadir</Button>
      </CardFooter>
    </Card>
  );
}

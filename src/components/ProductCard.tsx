'use client';

import type { Product } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useCart } from '@/hooks/use-cart';
import { BrakeDiscIcon } from './icons/BrakeDiscIcon';
import { BrakePadIcon } from './icons/BrakePadIcon';

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
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
      <CardHeader className="p-0">
        <div className="aspect-square relative flex items-center justify-center bg-muted/20">
          {product.category === 'Pastillas' ? (
            <BrakePadIcon className="w-1/4 h-1/4 text-muted-foreground" />
          ) : (
            <BrakeDiscIcon className="w-1/4 h-1/4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
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

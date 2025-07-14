
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { BrakePadIcon } from './icons/BrakePadIcon';
import { BrakeDiscIcon } from './icons/BrakeDiscIcon';
import { useCart } from '@/hooks/use-cart';
import Link from 'next/link';

interface FeaturedProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(price);
};

export function FeaturedProductCard({ product, onProductClick }: FeaturedProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Card 
        className="flex flex-col overflow-hidden h-full cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
        onClick={() => onProductClick(product)}
    >
      <div className="flex-shrink-0 bg-muted/50 p-4 flex items-center justify-center">
        {product.category === 'Pastillas' ? (
          <BrakePadIcon className="h-24 w-24 text-muted-foreground" />
        ) : (
          <BrakeDiscIcon className="h-24 w-24 text-muted-foreground" />
        )}
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-base leading-tight truncate flex-grow">{product.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{product.brand}</p>
        <p className="text-lg font-bold text-primary mt-2">{formatPrice(product.price)}</p>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <Button size="sm" className="flex-1" asChild>
                <Link href={`/productos/${product.id}`} onClick={(e) => e.stopPropagation()}>Ver Detalle</Link>
            </Button>
             <Button size="sm" variant="secondary" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Añadir
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

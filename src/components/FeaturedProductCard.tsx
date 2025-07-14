
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';

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
        <CardHeader className="flex-row items-start justify-between p-4">
            <CardTitle className="text-base font-bold leading-tight">{product.name}</CardTitle>
            <Star className={cn("h-5 w-5 flex-shrink-0", product.isFeatured ? "fill-primary text-primary" : "text-muted-foreground")} />
        </CardHeader>
        <CardContent className="p-4 pt-0 text-sm text-muted-foreground flex-grow space-y-1">
            <p className="font-mono text-xs">Código: {product.code}</p>
            <p>Marca: {product.brand}</p>
            <p>Modelo: {product.model}</p>
            <p>Compatibilidad: {product.compatibility}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <span className="font-bold text-foreground text-lg">{formatPrice(product.price)}</span>
            <Button size="sm" onClick={handleAddToCart}>
                Añadir
            </Button>
        </CardFooter>
    </Card>
  );
}

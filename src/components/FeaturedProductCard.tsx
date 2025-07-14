
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useDefaultImages } from '@/hooks/use-default-images';
import { BrakePadIcon } from './icons/BrakePadIcon';
import { BrakeDiscIcon } from './icons/BrakeDiscIcon';

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
  const { defaultPastillaImage, defaultDiscoImage } = useDefaultImages();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };
  
  const getProductImage = (product: Product) => {
    if (product.imageUrl) return product.imageUrl;
    if (product.category === 'Pastillas') return defaultPastillaImage;
    if (product.category === 'Discos') return defaultDiscoImage;
    return null;
  };
  
  const productImage = getProductImage(product);

  return (
    <Card 
        className="flex flex-col overflow-hidden h-full cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
        onClick={() => onProductClick(product)}
    >
        <CardHeader className="flex-col items-start p-4">
            <div className="flex flex-row items-start justify-between w-full">
              <CardTitle className="text-base font-bold leading-tight">{product.name}</CardTitle>
              <Star className={cn("h-5 w-5 flex-shrink-0", product.isFeatured ? "fill-primary text-primary" : "text-muted-foreground")} />
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
                <span>Código:</span> 
                <span className="font-mono text-xs">{product.code}</span>
            </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-grow flex flex-col justify-center items-center text-center">
            <div className="relative w-full h-24 mb-4">
                {productImage ? (
                    <Image
                        src={productImage}
                        alt={`Imagen de ${product.name}`}
                        fill
                        className="object-contain"
                        data-ai-hint={product.category === 'Pastillas' ? 'brake pad' : 'brake disc'}
                    />
                ) : (
                    product.category === 'Pastillas' ? (
                        <BrakePadIcon className="w-16 h-16 text-muted-foreground mx-auto" />
                    ) : (
                        <BrakeDiscIcon className="w-16 h-16 text-muted-foreground mx-auto" />
                    )
                )}
            </div>
            <div className="text-sm text-muted-foreground space-y-1 text-left w-full">
                <p><span className="font-medium">Marca:</span> {product.brand}</p>
                <p><span className="font-medium">Modelo:</span> {product.model}</p>
                <p className="truncate" title={product.compatibility}>
                  <span className="font-medium">Compatible:</span> {product.compatibility}
                </p>
            </div>
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


'use client';

import { useEffect, useState } from 'react';
import { getProductById } from '@/lib/products';
import { Product } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { BrakePadIcon } from '@/components/icons/BrakePadIcon';
import { BrakeDiscIcon } from '@/components/icons/BrakeDiscIcon';
import { useCart } from '@/hooks/use-cart';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(price);
};

export default function ProductDetailPage({ params }: { params: { productId: string } }) {
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      const productIdNum = parseInt(params.productId, 10);
      if (isNaN(productIdNum)) {
        setProduct(null);
        return;
      }
      const foundProduct = await getProductById(productIdNum);
      setProduct(foundProduct);
    }
    fetchProduct();
  }, [params.productId]);

  if (product === undefined) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Skeleton className="h-10 w-48 mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (product === null) {
    notFound();
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mb-8">
            <Link href="/productos" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Productos
            </Link>
        </div>
        <Card className="overflow-hidden">
            <CardHeader className="p-6">
                 <CardTitle className="text-3xl font-bold">{product.name}</CardTitle>
                 <p className="text-lg text-muted-foreground">{product.code}</p>
            </CardHeader>
            <CardContent className="p-6 pt-0">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                     <div className="relative aspect-square w-full bg-muted rounded-lg border overflow-hidden">
                         {product.imageUrl ? (
                             <Image
                                 src={product.imageUrl}
                                 alt={`Imagen de ${product.name}`}
                                 fill
                                 className="object-contain"
                                 data-ai-hint={product.category === 'Pastillas' ? 'brake pad' : 'brake disc'}
                             />
                         ) : (
                             product.category === 'Pastillas' ? (
                                <BrakePadIcon className="w-48 h-48 text-muted-foreground m-auto" />
                            ) : (
                                <BrakeDiscIcon className="w-48 h-48 text-muted-foreground m-auto" />
                            )
                         )}
                    </div>
                    <div className="flex flex-col space-y-6">
                        <div>
                            {product.isOnSale && typeof product.salePrice === 'number' && product.salePrice > 0 ? (
                              <div className="flex items-baseline gap-4 mb-4">
                                <p className="text-4xl font-extrabold text-primary">{formatPrice(product.salePrice)}</p>
                                <p className="text-2xl font-medium text-muted-foreground line-through">{formatPrice(product.price)}</p>
                              </div>
                            ) : (
                              <p className="text-4xl font-extrabold text-primary mb-4">{formatPrice(product.price)}</p>
                            )}
                             <Separator />
                        </div>
                        <div className="space-y-4 text-muted-foreground">
                            <div className="grid grid-cols-[100px,1fr] gap-x-4 gap-y-2 text-base">
                                <span className="font-semibold text-foreground">Marca:</span>
                                <span>{product.brand}</span>

                                <span className="font-semibold text-foreground">Modelo:</span>
                                <span>{product.model}</span>

                                <span className="font-semibold text-foreground">Categoría:</span>
                                <span>{product.category}</span>
                            </div>
                        </div>
                         <Separator />
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold text-foreground">Compatibilidad</h2>
                            <p className="text-base text-muted-foreground">{product.compatibility}</p>
                        </div>
                        <Button size="lg" onClick={() => addToCart(product)} className="w-full mt-auto">
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Añadir al Carrito
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

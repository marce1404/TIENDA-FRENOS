
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { BrakePadIcon } from '@/components/icons/BrakePadIcon';
import { BrakeDiscIcon } from '@/components/icons/BrakeDiscIcon';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const productId = params.id ? parseInt(params.id as string, 10) : null;

  useEffect(() => {
    if (productId) {
      const allProducts = getProducts();
      const foundProduct = allProducts.find((p) => p.id === productId);
      setProduct(foundProduct || null);
    }
    setIsMounted(true);
  }, [productId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

  if (!isMounted) {
    return (
      <div className="container mx-auto p-6 md:p-12">
        <div className="mb-8">
            <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-px w-full" />
                <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-2/3" />
                </div>
                 <Skeleton className="h-px w-full" />
                <Skeleton className="h-12 w-48" />
            </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto flex h-[60vh] flex-col items-center justify-center p-6 text-center">
        <h1 className="mb-4 text-4xl font-bold">Producto no Encontrado</h1>
        <p className="mb-8 text-muted-foreground">
          Lo sentimos, no pudimos encontrar el producto que estás buscando.
        </p>
        <Link href="/productos">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Productos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 md:p-12">
      <div className="mb-8">
        <Link href="/productos">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la lista
          </Button>
        </Link>
      </div>
      <div className="grid items-start gap-8 md:grid-cols-2 lg:gap-16">
        <div className="flex aspect-square items-center justify-center rounded-lg bg-card p-8">
          {product.category === 'Pastillas' ? (
            <BrakePadIcon className="h-48 w-48 text-muted-foreground" />
          ) : (
            <BrakeDiscIcon className="h-48 w-48 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold md:text-4xl">{product.name}</h1>
          <p className="text-2xl font-semibold text-primary">{formatPrice(product.price)}</p>
          <Separator />
          <div className="space-y-4 text-muted-foreground">
            <div className="grid grid-cols-2 gap-2">
              <span className="font-semibold text-foreground">Marca:</span>
              <span>{product.brand}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="font-semibold text-foreground">Modelo:</span>
              <span>{product.model}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="font-semibold text-foreground">Categoría:</span>
              <span>{product.category}</span>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Compatibilidad</h2>
            <p className="text-muted-foreground">{product.compatibility}</p>
          </div>
          <Separator />
          <div className="mt-4">
            <Button size="lg" className="w-full md:w-auto" onClick={() => addToCart(product)}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Añadir al Carrito
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

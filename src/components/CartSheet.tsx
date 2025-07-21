
'use client';

import { useCart } from '@/hooks/use-cart';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useEffect, useState } from 'react';
import { BrakePadIcon } from './icons/BrakePadIcon';
import { BrakeDiscIcon } from './icons/BrakeDiscIcon';
import { useDefaultImages } from '@/hooks/use-default-images';
import Image from 'next/image';
import { CartItem } from '@/lib/types';

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

export function CartSheet() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal } = useCart();
  const [whatsappNumber, setWhatsappNumber] = useState('56912345678');
  const { defaultPastillaImage, defaultDiscoImage } = useDefaultImages();
  
  useEffect(() => {
    const getWhatsappNumber = () => {
        let loadedNumber = '56912345678'; // Default value
        try {
          const savedInfo = localStorage.getItem('whatsappInfo');
          if (savedInfo) {
              const { number } = JSON.parse(savedInfo);
              if (number) {
                  loadedNumber = number;
              }
          }
        } catch (e) {
            // use default if parsing fails
        }
        setWhatsappNumber(loadedNumber);
    };

    getWhatsappNumber(); // Initial load

    // Listen for changes in localStorage
    const handleStorageChange = () => {
        getWhatsappNumber();
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleCheckout = () => {
    const messageLines = cartItems.map(item => {
        const priceToUse = item.isOnSale && typeof item.salePrice === 'number' && item.salePrice > 0 ? item.salePrice : item.price;
        return `- ${item.quantity}x ${item.name} (${item.brand}) - ${formatPrice(priceToUse * item.quantity)}`;
    });
    const message = `¡Hola! Quisiera cotizar los siguientes productos de REPUFRENOS.CL:\n\n${messageLines.join('\n')}\n\n*Total: ${formatPrice(cartTotal)}*`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getProductImage = (item: CartItem) => {
    if (item.imageUrl) return item.imageUrl;
    if (item.category === 'Pastillas') return defaultPastillaImage;
    if (item.category === 'Discos') return defaultDiscoImage;
    return null;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <ShoppingCart className="h-6 w-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {cartCount}
            </span>
          )}
          <span className="sr-only">Carrito de compras</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader className='pr-6'>
          <SheetTitle>Carrito de Compras ({cartCount})</SheetTitle>
        </SheetHeader>
        <Separator />
        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-4 py-4 pr-6">
                {cartItems.map((item) => {
                  const itemImage = getProductImage(item);
                  const priceToUse = item.isOnSale && typeof item.salePrice === 'number' && item.salePrice > 0 ? item.salePrice : item.price;
                  return (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative flex-shrink-0 w-16 h-16 rounded-md bg-muted/50 flex items-center justify-center border overflow-hidden">
                        {itemImage ? (
                           <Image src={itemImage} alt={`Imagen de ${item.name}`} fill className="object-contain" />
                        ) : (
                          item.category === 'Pastillas' ? (
                            <BrakePadIcon className="w-8 h-8 text-muted-foreground" />
                          ) : (
                            <BrakeDiscIcon className="w-8 h-8 text-muted-foreground" />
                          )
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center gap-2">
                           {item.isOnSale && typeof item.salePrice === 'number' && item.salePrice > 0 ? (
                              <>
                                <p className="text-sm text-primary font-bold">{formatPrice(item.salePrice)}</p>
                                <p className="text-sm text-muted-foreground line-through">{formatPrice(item.price)}</p>
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span>{item.quantity}</span>
                           <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className='flex flex-col items-end'>
                         <p className="font-medium">{formatPrice(priceToUse * item.quantity)}</p>
                         <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => removeFromCart(item.id)}
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter>
                <div className='w-full space-y-4'>
                    <div className="flex justify-between text-lg font-semibold">
                        <span>Subtotal:</span>
                        <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className='flex justify-between gap-2'>
                        <Button variant="outline" onClick={clearCart}>Vaciar Carrito</Button>
                        <SheetClose asChild>
                            <Button className='flex-1' onClick={handleCheckout}>Finalizar Compra</Button>
                        </SheetClose>
                    </div>
                </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">Tu carrito está vacío.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

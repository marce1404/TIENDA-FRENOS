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

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

export function CartSheet() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal } = useCart();
  const [whatsappNumber, setWhatsappNumber] = useState('56912345678');
  
  useEffect(() => {
    const getWhatsappNumber = () => {
        let loadedNumber = '56912345678'; // Default value
        const savedInfo = localStorage.getItem('whatsappInfo');
        if (savedInfo) {
            try {
                const { number } = JSON.parse(savedInfo);
                if (number) {
                    loadedNumber = number;
                }
            } catch (e) {
                // use default if parsing fails
            }
        }
        setWhatsappNumber(loadedNumber);
    };

    getWhatsappNumber(); // Initial load

    // Listen for changes in localStorage
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'whatsappInfo') {
            getWhatsappNumber();
        }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleCheckout = () => {
    const messageLines = cartItems.map(item => 
        `- ${item.quantity}x ${item.name} (${item.brand}) - ${formatPrice(item.price * item.quantity)}`
    );
    const message = `¡Hola! Quisiera cotizar los siguientes productos de REPUFRENOS.CL:\n\n${messageLines.join('\n')}\n\n*Total: ${formatPrice(cartTotal)}*`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-md bg-muted/50 flex items-center justify-center border">
                      {item.category === 'Pastillas' ? (
                        <BrakePadIcon className="w-8 h-8 text-muted-foreground" />
                      ) : (
                        <BrakeDiscIcon className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
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
                       <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
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
                ))}
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

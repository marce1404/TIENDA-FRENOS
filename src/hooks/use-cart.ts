
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product, CartItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import type { AppSettings } from '@/lib/env';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  whatsappNumber: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// El provider ahora acepta la configuración como props para asegurar consistencia
export function CartProvider({ children, settings }: { children: React.ReactNode, settings: AppSettings }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  // El número de WhatsApp se inicializa desde las props pasadas por el layout del servidor
  const [whatsappNumber, setWhatsappNumber] = useState(settings.WHATSAPP_NUMBER || '56912345678');
  
  useEffect(() => {
      // Actualiza el número si las settings cambian (por ejemplo, en navegación del lado del cliente)
      if (settings.WHATSAPP_NUMBER) {
          setWhatsappNumber(settings.WHATSAPP_NUMBER);
      }
  }, [settings.WHATSAPP_NUMBER]);


  useEffect(() => {
    // Cargar el carrito desde localStorage es seguro, ya que es específico de la sesión del usuario.
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (e) {
        setCartItems([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
    toast({
      title: "¡Añadido al Carrito!",
      description: `${product.name} se ha añadido a tu cotización.`,
      duration: 3000,
    });
  }, [toast]);

  const removeFromCart = useCallback((productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setCartItems(prevItems => {
      if (quantity <= 0) {
        return prevItems.filter(item => item.id !== productId);
      }
      return prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);
  
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const cartTotal = cartItems.reduce((total, item) => {
    const priceToUse = item.isOnSale && typeof item.salePrice === 'number' && item.salePrice > 0 ? item.salePrice : item.price;
    return total + priceToUse * item.quantity;
  }, 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
    whatsappNumber
  };

  return React.createElement(CartContext.Provider, { value }, children);
}

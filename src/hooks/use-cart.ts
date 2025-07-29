
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product, CartItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getEnvSettings } from '@/lib/env';

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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const [whatsappNumber, setWhatsappNumber] = useState('56912345678');


  useEffect(() => {
    // Load cart from localStorage - this is session-specific and okay
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (e) {
        setCartItems([]);
      }
    }
    
    // Load global settings from the server
    async function loadSettings() {
        try {
            const settings = await getEnvSettings();
            if (settings.WHATSAPP_NUMBER) {
                setWhatsappNumber(settings.WHATSAPP_NUMBER);
            }
        } catch (e) {
            console.error("Could not load settings for cart provider", e);
        }
    }
    loadSettings();

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


'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import type { Product } from '@/lib/types';

interface ProductDialogContactProps {
  product: Product;
}

export function ProductDialogContact({ product }: ProductDialogContactProps) {
  const [whatsappNumber, setWhatsappNumber] = useState('56912345678');
  
  useEffect(() => {
    const getWhatsappNumber = () => {
        let loadedNumber = '56912345678';
        const savedInfo = localStorage.getItem('whatsappInfo');
        if (savedInfo) {
            try {
                const { number } = JSON.parse(savedInfo);
                if (number) loadedNumber = number;
            } catch (e) {
                // use default if parsing fails
            }
        }
        setWhatsappNumber(loadedNumber);
    };

    getWhatsappNumber();
  }, []);

  const handleContactClick = () => {
    const message = `¡Hola! Tengo una duda sobre el producto "${product.name}" (código: ${product.code}).`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <Button onClick={handleContactClick} size="sm" className="shadow-lg bg-green-500 hover:bg-green-600 text-white">
        <WhatsAppIcon className="h-5 w-5 mr-2" />
        Si tienes dudas, contáctanos
      </Button>
    </div>
  );
}

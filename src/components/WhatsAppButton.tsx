
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

export function WhatsAppButton() {
  const [whatsappNumber, setWhatsappNumber] = useState('56912345678');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const getWhatsappNumber = () => {
        let loadedNumber = '56912345678'; // Default number
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
    
    getWhatsappNumber();
    setIsMounted(true);

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

  const openWhatsApp = () => {
    const whatsappUrl = `https://wa.me/${whatsappNumber}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isMounted) return null;

  return (
    <div className={cn("fixed bottom-6 left-6 z-50")}>
      <button
        onClick={openWhatsApp}
        className="h-14 w-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 flex items-center justify-center"
        aria-label="Contactar por WhatsApp"
      >
        <WhatsAppIcon className="h-8 w-8" />
      </button>
    </div>
  );
}

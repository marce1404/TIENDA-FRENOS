
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { WhatsAppIcon } from './icons/WhatsAppIcon';


export function WhatsAppButton({ initialNumber }: { initialNumber?: string | null }) {
  const [whatsappNumber] = useState(initialNumber || '56912345678');
  
  const openWhatsApp = () => {
    const whatsappUrl = `https://wa.me/${whatsappNumber}`;
    window.open(whatsappUrl, '_blank');
  };
  
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

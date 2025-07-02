
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export function WhatsappButton() {
  const [whatsappNumber, setWhatsappNumber] = useState('56912345678');

  useEffect(() => {
    const savedNumber = localStorage.getItem('whatsappNumber');
    if (savedNumber) {
      setWhatsappNumber(savedNumber);
    }
  }, []);

  return (
    <Link
      href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-8 w-8" />
    </Link>
  );
}

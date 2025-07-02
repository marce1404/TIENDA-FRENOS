
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, MessageCircle } from 'lucide-react';

export default function ContactoPage() {
  const [whatsappNumber, setWhatsappNumber] = useState('56912345678');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedInfo = localStorage.getItem('whatsappInfo');
    if (savedInfo) {
      try {
        const { number } = JSON.parse(savedInfo);
        if (number) {
          setWhatsappNumber(number);
        }
      } catch (e) {
        // Ignore error, use default
      }
    } else {
      // Fallback for old key
      const savedNumber = localStorage.getItem('whatsappNumber');
      if (savedNumber) {
        setWhatsappNumber(savedNumber);
      }
    }
    setIsMounted(true);
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold">Contacto</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          ¿Tienes alguna pregunta o necesitas un repuesto específico? Estamos aquí para ayudarte. Rellena el formulario o contáctanos directamente.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Envíanos un Mensaje</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <Input placeholder="Tu Nombre" />
              <Input type="email" placeholder="Tu Correo Electrónico" />
              <Input placeholder="Asunto" />
              <Textarea placeholder="Tu Mensaje" rows={5} />
              <Button type="submit" className="w-full">Enviar Mensaje</Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Información de Contacto</h2>
          <div className="space-y-4 text-lg">
             <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-primary" />
                <span>contacto@todofrenos.cl</span>
             </div>
             <div className="flex items-center gap-4">
                <MessageCircle className="h-6 w-6 text-primary" />
                {isMounted ? (
                  <span>
                    +
                    {whatsappNumber} (Solo WhatsApp)
                  </span>
                ) : (
                  <span>Cargando...</span>
                )}
             </div>
             <div className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-primary" />
                <span>av la palmilla #4780 Conchalí, Santiago</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

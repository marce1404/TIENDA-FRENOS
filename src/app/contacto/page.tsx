
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Loader2 } from 'lucide-react';
import { sendEmail } from '@/actions/sendEmail';
import { useToast } from "@/hooks/use-toast";
import { useCart } from '@/hooks/use-cart';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';

export default function ContactoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { whatsappNumber } = useCart();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };
    
    const result = await sendEmail(data);

    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "¡Mensaje Enviado!",
        description: "Gracias por contactarnos. Te responderemos a la brevedad.",
      });
      (e.target as HTMLFormElement).reset();
    } else {
      toast({
        variant: "destructive",
        title: "Error al enviar",
        description: result.error || 'Ocurrió un error. Por favor, inténtalo de nuevo.',
      });
    }
  };


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
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="name"
                placeholder="Tu Nombre"
                required
                disabled={isSubmitting}
              />
              <Input
                name="email"
                type="email"
                placeholder="Tu Correo Electrónico"
                required
                disabled={isSubmitting}
              />
              <Input
                name="subject"
                placeholder="Asunto"
                required
                disabled={isSubmitting}
              />
              <Textarea
                name="message"
                placeholder="Tu Mensaje"
                rows={5}
                required
                disabled={isSubmitting}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : 'Enviar Mensaje'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Información de Contacto</h2>
          <div className="space-y-4 text-lg">
             <div className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-primary" />
                <span>Av. La Palmilla #4780, Conchalí, Santiago</span>
             </div>
              {whatsappNumber && (
                <div className="flex items-center gap-4">
                  <WhatsAppIcon className="h-6 w-6 text-primary" />
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    +{whatsappNumber}
                  </a>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { sendChatInquiry } from '@/actions/sendChatInquiry';

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
    };

    const result = await sendChatInquiry(data);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "¡Mensaje Enviado!",
        description: "Gracias por contactarnos. Te responderemos a la brevedad.",
      });
      (e.target as HTMLFormElement).reset();
      setIsOpen(false);
    } else {
      toast({
        variant: "destructive",
        title: "Error al enviar",
        description: result.error || "Ocurrió un problema. Por favor, inténtalo de nuevo.",
      });
    }
  };


  return (
    <>
      <div className={cn("fixed bottom-6 right-6 z-50 transition-opacity", isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100')}>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
          aria-label="Abrir chat de ayuda"
        >
          <MessageSquare className="h-8 w-8" />
        </Button>
      </div>

      <div className={cn(
          "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out",
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}>
        <Card className="w-80 shadow-2xl">
           <form onSubmit={handleSubmit}>
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <div>
                <CardTitle className="text-lg">¿En qué puedo ayudarte?</CardTitle>
                <CardDescription className="text-xs">Te responderemos a tu correo.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Cerrar chat</span>
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
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
              <Textarea
                name="message"
                placeholder="Escribe tu mensaje aquí..."
                rows={4}
                required
                disabled={isSubmitting}
              />
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Mensaje
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}

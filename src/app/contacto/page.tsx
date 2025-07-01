
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Contacto</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            ¿Tienes alguna pregunta o necesitas un repuesto específico? Estamos aquí para ayudarte. Rellena el formulario o contáctanos directamente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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
                  <span>contacto@aquifrenos.cl</span>
               </div>
               <div className="flex items-center gap-4">
                  <Phone className="h-6 w-6 text-primary" />
                  <span>+56 9 1234 5678</span>
               </div>
               <div className="flex items-center gap-4">
                  <MapPin className="h-6 w-6 text-primary" />
                  <span>Av. Principal 123, Santiago, Chile</span>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

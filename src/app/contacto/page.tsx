
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactoPage() {
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
    </div>
  );
}

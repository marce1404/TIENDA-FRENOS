import { MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border mt-auto py-6">
      <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
        <div className="flex justify-center items-center gap-2 mb-2">
          <MapPin className="h-4 w-4" />
          <span>av la palmilla #4780 Conchalí, Santiago</span>
        </div>
        <p>&copy; {currentYear} todofrenos.cl. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

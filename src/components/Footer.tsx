
'use client';

import Link from 'next/link';
import { MapPin, UserCog } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Footer() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-background border-t border-border mt-auto py-6">
      <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
        <div className="flex justify-center items-center gap-2 mb-2">
          <MapPin className="h-4 w-4" />
          <span>Av. La Palmilla #4780 Conchalí, Santiago</span>
        </div>
        <div className="flex justify-center items-center gap-4">
            <p>&copy; {currentYear} REPUFRENOS.CL. Todos los derechos reservados. | v6.5</p>
            <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors" title="Acceso de Administrador">
                <UserCog className="h-4 w-4" />
                <span className="sr-only">Admin</span>
            </Link>
        </div>
      </div>
    </footer>
  );
}

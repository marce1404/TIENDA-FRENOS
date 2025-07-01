
"use client";

import Link from 'next/link';
import { Factory, Cog } from 'lucide-react'; // Changed Fuel to Factory
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Factory className="h-7 w-7" /> {/* Changed Fuel to Factory */}
            <span>SerAPP</span>
          </Link>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/workshop/edit" title="Configuración del Taller">
              <span>
                <Cog className="h-6 w-6" />
                <span className="sr-only">Configuración del Taller</span>
              </span>
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-muted text-muted-foreground py-4 text-center text-sm">
        <div className="container mx-auto px-4">
          © {new Date().getFullYear()} SerAPP. ¡Mantén tus viajes suaves!
        </div>
      </footer>
      <Toaster />
    </div>
  );
}

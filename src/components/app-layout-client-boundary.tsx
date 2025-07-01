
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { useEffect, useState } from 'react';

export function AppLayoutClientBoundary({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Puedes mostrar un esqueleto/loader aquí si lo deseas, 
    // o null para no renderizar nada hasta que el cliente esté listo.
    return (
      <div className="flex min-h-screen items-center justify-center">
        {/* Loader opcional */}
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}


import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/hooks/use-cart';
import { AppLayout } from '@/components/layout/app-layout';
import { getEnvSettings } from '@/lib/env';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Repufrenos.cl',
    default: 'Repuestos de Frenos en Santiago, Conchalí | Pastillas y Discos | Repufrenos.cl',
  },
  description: 'Encuentra repuestos de frenos de alta calidad en Santiago. Somos especialistas en pastillas, discos y balatas para todas las marcas. Asesoramiento experto en Conchalí. ¡Cotiza online!',
  keywords: ['repuestos de frenos chile', 'pastillas de freno', 'discos de freno', 'venta de frenos online', 'despacho a regiones', 'frenos para auto', 'Brembo', 'Bosch', 'TRW', 'repuestos para autos chile'],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getEnvSettings();
  
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} antialiased`}>
        <CartProvider settings={settings}>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}

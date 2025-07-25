
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/hooks/use-cart';
import { AppLayout } from '@/components/layout/app-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Repufrenos.cl',
    default: 'Repuestos de Frenos en Santiago, Conchalí | Pastillas y Discos | Repufrenos.cl',
  },
  description: 'Encuentra repuestos de frenos de alta calidad en Santiago. Somos especialistas en pastillas, discos y balatas para todas las marcas. Asesoramiento experto en Conchalí. ¡Cotiza online!',
  keywords: ['repuestos de frenos santiago', 'pastillas de freno conchalí', 'discos de freno santiago', 'venta de frenos', 'balatas para auto', 'taller de frenos conchalí', 'Brembo Chile', 'Bosch frenos', 'repuestos para autos santiago'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} antialiased`}>
        <CartProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}


import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/hooks/use-cart';
import { AppLayout } from '@/components/layout/app-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | REPUFRENOS.CL',
    default: 'REPUFRENOS.CL - Especialistas en Sistemas de Frenos',
  },
  description: 'REPUFRENOS.CL. Tienda especialista en repuestos de frenos de alta calidad. Asesoramiento experto y las mejores marcas para tu seguridad. Pastillas, discos y más.',
  keywords: ['frenos', 'repuestos de frenos', 'pastillas de freno', 'discos de freno', 'balatas', 'Brembo', 'Bosch', 'Conchalí', 'Santiago'],
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

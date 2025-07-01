
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppLayoutClientBoundary } from '@/components/app-layout-client-boundary';

const geistSans = Geist({ 
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ 
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SerAPP - Tienda de Frenos y Mantenimiento',
  description: 'Gestión de clientes y servicios para tu tienda de frenos y mantenimiento vehicular.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* La etiqueta <head> es manejada por Next.js a través de 'metadata' y 'generateMetadata' */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppLayoutClientBoundary>
          {children}
        </AppLayoutClientBoundary>
      </body>
    </html>
  );
}

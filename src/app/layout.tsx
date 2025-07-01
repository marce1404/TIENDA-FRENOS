
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppLayoutClientBoundary } from '@/components/app-layout-client-boundary';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SerAPP - Gestión de Taller',
  description: 'Gestiona el historial de servicios de los vehículos de tu taller.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        <AppLayoutClientBoundary>{children}</AppLayoutClientBoundary>
      </body>
    </html>
  );
}

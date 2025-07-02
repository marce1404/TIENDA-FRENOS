
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsappButton } from '@/components/WhatsappButton';
import { CartProvider } from '@/hooks/use-cart';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'todofrenos.cl - Repuestos de Freno',
  description: 'Tienda especialista en repuestos de frenos de alta calidad.',
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
          <div className="relative flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <WhatsappButton />
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}

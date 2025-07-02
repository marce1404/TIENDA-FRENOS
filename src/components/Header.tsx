
"use client";

import Link from 'next/link';
import { Logo } from './Logo';
import { ShoppingCart } from 'lucide-react';

export function Header() {
  
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/productos', label: 'Productos' },
    { href: '/contacto', label: 'Contacto' },
  ];

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-lg">todofrenos.cl</span>
            </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link key={link.label} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
           <button className="text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingCart className="h-6 w-6" />
            <span className="sr-only">Carrito de compras</span>
           </button>
        </div>
      </div>
    </header>
  );
}

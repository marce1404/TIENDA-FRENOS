
"use client";

import Link from 'next/link';
import { Logo } from './Logo';
import { ShoppingCart } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useSidebar } from './ui/sidebar';

export function Header() {
  const sidebar = useSidebar();
  
  const navLinks = [
    { href: '/productos', label: 'Productos' },
    { href: '/contacto', label: 'Contacto' },
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
            {sidebar && <SidebarTrigger className="md:hidden" />}
            <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-lg">aquifrenos.cl</span>
            </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link key={link.label} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              {link.icon && <link.icon className="h-4 w-4" />}
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

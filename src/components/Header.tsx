
"use client";

import Link from 'next/link';
import { logo } from './logo';
import { CartSheet } from './CartSheet';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from './ui/sheet';
import { Menu } from 'lucide-react';

export function Header() {
  
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/productos', label: 'Productos' },
    { href: '/contacto', label: 'Contacto' },
  ];

  const LogoComponent = logo;

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <LogoComponent className="h-8 w-8 text-primary" />
          <span className="font-bold text-lg hidden sm:inline-block">REPUFRENOS.CL</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link key={link.label} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions and Mobile Menu */}
        <div className="flex items-center gap-2">
           <CartSheet />

           <div className="md:hidden">
             <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <Link href="/" className="flex items-center gap-2 mb-8">
                    <LogoComponent className="h-8 w-8 text-primary" />
                    <span className="font-bold text-lg">REPUFRENOS.CL</span>
                  </Link>
                  <nav className="grid gap-4">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center gap-4 px-2.5 text-lg text-muted-foreground hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
           </div>
        </div>
      </div>
    </header>
  );
}

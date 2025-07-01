
"use client";

import { useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { products as allProducts } from '@/data/products';
import type { Product } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.compatibility.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter =
      activeFilter === 'Todos' || product.category === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const filters = ['Todos', 'Discos', 'Pastillas', 'Kits'];

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold">Nuestros Productos</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          Explora nuestro catálogo completo de discos, pastillas y kits de freno. Utiliza el buscador para encontrar exactamente lo que necesitas.
        </p>
      </section>

      <section className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Busca por nombre, marca, modelo o compatibilidad..."
            className="pl-10 w-full bg-input border-border focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-center gap-2">
          {filters.map(filter => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'secondary'}
              onClick={() => setActiveFilter(filter)}
              className={activeFilter === filter ? 'bg-primary' : 'bg-secondary'}
            >
              {filter}
            </Button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>

      {filteredProducts.length === 0 && (
         <div className="text-center py-16 col-span-full">
            <p className="text-muted-foreground">No se encontraron productos que coincidan con tu búsqueda.</p>
         </div>
      )}

      <Link
        href="https://wa.me/YOUR_WHATSAPP_NUMBER"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white rounded-full p-4 shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="h-8 w-8" />
      </Link>
    </div>
  );
}

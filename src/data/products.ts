
import type { Product } from '@/lib/types';

export const products: Product[] = [
  {
    id: 1,
    name: 'Pastilla Freno',
    brand: 'Baleno',
    compatibility: 'Chevrolet, Susuki Alto',
    price: 35000,
    category: 'Pastillas',
    imageUrl: 'https://placehold.co/400x400.png',
  },
  {
    id: 2,
    name: 'Pastillas de Freno Cerámicas',
    brand: 'Brembo',
    compatibility: 'Toyota Yaris 2018-2022',
    price: 89990,
    category: 'Pastillas',
    imageUrl: 'https://placehold.co/400x400.png',
  },
  {
    id: 3,
    name: 'Disco de Freno Perforado Delantero',
    brand: 'Brembo',
    compatibility: 'Chevrolet Onix 2020-2023',
    price: 129990,
    category: 'Discos',
    imageUrl: 'https://placehold.co/400x400.png',
  },
  {
    id: 4,
    name: 'Kit Frenos Performance',
    brand: 'Brembo',
    compatibility: 'Subaru Impreza',
    price: 249990,
    category: 'Kits',
    imageUrl: 'https://placehold.co/400x400.png',
  },
  {
    id: 5,
    name: 'Disco de Freno Trasero',
    brand: 'TRW',
    compatibility: 'Volkswagen Golf MK7',
    price: 95000,
    category: 'Discos',
    imageUrl: 'https://placehold.co/400x400.png',
  },
  {
    id: 6,
    name: 'Kit Pastillas y Discos',
    brand: 'ATE',
    compatibility: 'BMW Serie 3 F30',
    price: 310000,
    category: 'Kits',
    imageUrl: 'https://placehold.co/400x400.png',
  },
];

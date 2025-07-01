
"use client";

import type { Vehicle } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowRight, Car } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
      <CardHeader className="p-0">
        <Link href={`/vehicles/${vehicle.id}`} className="block aspect-video relative">
            <Image
                src={vehicle.imageUrl || 'https://placehold.co/600x400.png'}
                alt={`${vehicle.make} ${vehicle.model}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                data-ai-hint="car side"
            />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-1">
        <CardTitle className="text-lg font-bold leading-tight flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            {vehicle.year} {vehicle.make} {vehicle.model}
        </CardTitle>
        <CardDescription>
          <span className="font-semibold">Patente:</span> {vehicle.patente}
        </CardDescription>
         <CardDescription>
          <span className="font-semibold">Propietario:</span> {vehicle.ownerName}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0">
         <Button asChild className="w-full">
            <Link href={`/vehicles/${vehicle.id}`}>
                Ver Historial <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

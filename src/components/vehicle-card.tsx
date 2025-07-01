
"use client";

import type { Vehicle } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Car, History, BadgeInfo, Droplet, Wrench, Cog, UserCircle } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  oilChangeCount: number;
  brakeServiceCount: number;
  mechanicServiceCount: number;
}

export function VehicleCard({ 
  vehicle, 
  oilChangeCount, 
  brakeServiceCount,
  mechanicServiceCount
}: VehicleCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="pb-1 pt-3 px-3">
        {vehicle.ownerName ? (
          <>
            <div className="flex items-center gap-1.5 mb-0.5">
              <UserCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">{vehicle.ownerName}</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              {vehicle.make} {vehicle.model}
            </CardDescription>
            <CardDescription className="text-xs">Año: {vehicle.year}</CardDescription>
            <CardDescription className="text-xs flex items-center gap-1">
                <BadgeInfo className="h-3 w-3 text-muted-foreground" /> Patente: {vehicle.patente}
            </CardDescription>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Car className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">{vehicle.make} {vehicle.model}</CardTitle>
            </div>
            <CardDescription className="text-xs">Año: {vehicle.year}</CardDescription>
            <CardDescription className="text-xs flex items-center gap-1">
                <BadgeInfo className="h-3 w-3 text-muted-foreground" /> Patente: {vehicle.patente}
            </CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent className="flex-grow space-y-0.5 px-3 pb-1 pt-1.5">
        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
          <Droplet className="h-3 w-3 text-blue-500"/>
          {oilChangeCount} cambio(s) de aceite.
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Wrench className="h-3 w-3 text-red-500"/>
          {brakeServiceCount} servicio(s) de frenos.
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Cog className="h-3 w-3 text-green-500"/>
          {mechanicServiceCount} servicio(s) de mecánica.
        </p>
      </CardContent>
      <CardFooter className="pt-1.5 px-3 pb-3">
        <Button asChild variant="default" size="sm" className="w-full h-8 text-xs">
          <Link href={`/vehicles/${vehicle.id}`}>
            <span className="inline-flex items-center justify-center"> {/* Ensure this span is the single child */}
              <History className="mr-1.5 h-3 w-3" /> Ver Historial
            </span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

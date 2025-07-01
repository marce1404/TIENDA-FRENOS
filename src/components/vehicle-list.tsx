
"use client";

import { useState } from 'react';
import { useVehicles } from '@/hooks/use-vehicles';
import { VehicleCard } from './vehicle-card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { PlusCircle, Search, Car } from 'lucide-react';
import Link from 'next/link';

export function VehicleList() {
  const { vehicles } = useVehicles();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.patente.toLowerCase().replace(/-/g, '').includes(searchTerm.toLowerCase().replace(/-/g, '')) ||
    vehicle.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => a.make.localeCompare(b.make) || a.model.localeCompare(b.model));

  return (
    <div className="space-y-8">
      <section className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
            <Car className="h-8 w-8 text-primary" />
            Mis Vehículos
        </h1>
        <Button asChild>
          <Link href="/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar Vehículo
          </Link>
        </Button>
      </section>

      <section>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por marca, modelo, patente o propietario..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section>
        {vehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredVehicles.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-muted rounded-lg">
            <h2 className="text-xl font-semibold">No tienes vehículos registrados</h2>
            <p className="text-muted-foreground mt-2 mb-4">Empieza agregando el primer vehículo de un cliente.</p>
            <Button asChild>
              <Link href="/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Agregar Vehículo
              </Link>
            </Button>
          </div>
        )}
         {vehicles.length > 0 && filteredVehicles.length === 0 && (
          <div className="text-center py-16 col-span-full">
            <p className="text-muted-foreground">No se encontraron vehículos que coincidan con tu búsqueda.</p>
         </div>
        )}
      </section>
    </div>
  );
}


"use client";

import Link from 'next/link';
import Image from 'next/image'; 
import { Button } from '@/components/ui/button';
import { VehicleCard } from '@/components/vehicle-card';
import { useVehicles } from '@/hooks/use-vehicles';
import { useOilChanges } from '@/hooks/use-oil-changes';
import { useBrakeServices } from '@/hooks/use-brake-services';
import { useMechanicServices } from '@/hooks/use-mechanic-services';
import { PlusCircle, Search } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { useWorkshopInfo } from '@/hooks/use-workshop-info';

export default function HomePage() {
  const { vehicles, deleteVehicle } = useVehicles();
  const { deleteAllOilChangesForVehicle } = useOilChanges(); 
  const { deleteAllBrakeServicesForVehicle } = useBrakeServices();
  const { deleteAllMechanicServicesForVehicle } = useMechanicServices();
  const { workshopInfo } = useWorkshopInfo(); 
  
  const [vehicleOilChangeCounts, setVehicleOilChangeCounts] = useState<Record<string, number>>({});
  const [vehicleBrakeServiceCounts, setVehicleBrakeServiceCounts] = useState<Record<string, number>>({});
  const [vehicleMechanicServiceCounts, setVehicleMechanicServiceCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  

  useEffect(() => {
    setIsLoading(true);
    const oilCounts: Record<string, number> = {};
    const brakeCounts: Record<string, number> = {};
    const mechanicCounts: Record<string, number> = {};
    
    vehicles.forEach(vehicle => {
      try {
        const oilItem = window.localStorage.getItem(`oilChangeApp_oilChanges_${vehicle.id}`);
        oilCounts[vehicle.id] = oilItem ? JSON.parse(oilItem).length : 0;

        const brakeItem = window.localStorage.getItem(`oilChangeApp_brakeServices_${vehicle.id}`);
        brakeCounts[vehicle.id] = brakeItem ? JSON.parse(brakeItem).length : 0;

        const mechanicItem = window.localStorage.getItem(`oilChangeApp_mechanicServices_${vehicle.id}`);
        mechanicCounts[vehicle.id] = mechanicItem ? JSON.parse(mechanicItem).length : 0;

      } catch (e) {
        oilCounts[vehicle.id] = 0;
        brakeCounts[vehicle.id] = 0;
        mechanicCounts[vehicle.id] = 0;
      }
    });
    setVehicleOilChangeCounts(oilCounts);
    setVehicleBrakeServiceCounts(brakeCounts);
    setVehicleMechanicServiceCounts(mechanicCounts);
    setIsLoading(false);
  }, [vehicles]);

  const handleDeleteVehicle = useCallback((id: string) => {
    deleteAllOilChangesForVehicle(id);
    deleteAllBrakeServicesForVehicle(id);
    deleteAllMechanicServicesForVehicle(id);
    deleteVehicle(id);
  }, [deleteAllOilChangesForVehicle, deleteAllBrakeServicesForVehicle, deleteAllMechanicServicesForVehicle, deleteVehicle]);

  const filteredVehicles = useMemo(() => {
    if (!searchTerm) return vehicles;
    return vehicles.filter(vehicle => 
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.year.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.patente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.ownerName && vehicle.ownerName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [vehicles, searchTerm]);
  
  if (isLoading && vehicles.length > 0) {
    return (
      <div className="space-y-6">
        <div className="bg-card p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-start">
                <div className="h-6 bg-primary/20 rounded w-32 mb-1"></div>
                <div className="h-7 bg-muted rounded w-48"></div>
            </div>
            <div className="h-11 bg-primary/50 rounded w-full sm:w-auto px-8 mt-2 sm:mt-0"></div>
          </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse bg-card p-4 rounded-lg shadow-md space-y-2">
              <div className="h-7 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-1/4 mt-2"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
              <div className="flex gap-2 mt-2">
                <div className="h-9 bg-muted rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-card p-6 rounded-xl shadow-lg mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-start text-center sm:text-left">
            {workshopInfo?.name && (
              <span className="text-xl font-semibold text-primary mb-1">{workshopInfo.name}</span>
            )}
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Mis Vehículos</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow">
              <Link href="/vehicles/new">
                <span>
                  <PlusCircle className="mr-2 h-5 w-5" /> Nuevo Vehículo
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          type="text"
          placeholder="Buscar por Marca, Modelo, Año, Patente o Propietario..."
          className="pl-10 w-full shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {vehicles.length === 0 && !searchTerm ? (
        <div className="text-center py-12 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-card shadow-sm">
          <Image 
            src="https://placehold.co/600x400.png" 
            alt="Taller de frenos" 
            width={600} 
            height={400}
            className="w-full max-w-md mx-auto rounded-lg shadow-md mb-6"
            data-ai-hint="brake workshop"
          />
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">Bienvenido a tu Gestor de Servicios</h2>
          <p className="text-muted-foreground mb-6">Administra los vehículos y servicios de tus clientes. ¡Comienza agregando el primer vehículo!</p>
          <Button asChild>
            <Link href="/vehicles/new">
              <span>
                <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Vehículo
              </span>
            </Link>
          </Button>
        </div>
      ) : filteredVehicles.length === 0 && searchTerm ? (
        <div className="text-center py-12 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-card shadow-sm">
          <Search className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">No se encontraron vehículos</h2>
          <p className="text-muted-foreground mb-6">Ningún vehículo coincide con tu búsqueda "{searchTerm}". Intenta una búsqueda diferente o borra la búsqueda.</p>
          <Button variant="outline" onClick={() => setSearchTerm('')}>
            Borrar Búsqueda
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              oilChangeCount={vehicleOilChangeCounts[vehicle.id] || 0}
              brakeServiceCount={vehicleBrakeServiceCounts[vehicle.id] || 0}
              mechanicServiceCount={vehicleMechanicServiceCounts[vehicle.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

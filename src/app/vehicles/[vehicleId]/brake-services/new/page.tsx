pue
"use client";

import { BrakeServiceForm } from '@/components/brake-service-form';
import { useBrakeServices } from '@/hooks/use-brake-services';
import { useVehicles } from '@/hooks/use-vehicles';
import { useRouter, useParams } from 'next/navigation';
import type { BrakeServiceRecord } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wrench } from 'lucide-react';

export default function AddBrakeServicePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.vehicleId as string;
  
  const { getVehicleById } = useVehicles();
  const { addBrakeService } = useBrakeServices(vehicleId);
  const [vehicleName, setVehicleName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (vehicleId) {
      const vehicle = getVehicleById(vehicleId);
      if (vehicle) {
        setVehicleName(`${vehicle.year} ${vehicle.make} ${vehicle.model}`);
      } else {
        setVehicleName("Vehículo no encontrado");
      }
      setIsLoading(false);
    }
  }, [vehicleId, getVehicleById]);

  const handleSubmit = (data: Omit<BrakeServiceRecord, 'id' | 'vehicleId'>) => {
    addBrakeService(data);
    router.push(`/vehicles/${vehicleId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-96 w-full max-w-lg mx-auto" />
      </div>
    );
  }
  
  if (!vehicleName || vehicleName === "Vehículo no encontrado") {
     return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold text-destructive mb-4">Vehículo No Encontrado</h1>
        <p className="text-muted-foreground mb-6">El vehículo para el que intentas agregar un servicio de frenos no existe.</p>
        <Button asChild variant="outline">
          <Link href="/">
            <span>
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Lista
            </span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <Button variant="outline" asChild className="mb-4">
        <Link href={`/vehicles/${vehicleId}`}>
          <span>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Detalles
          </span>
        </Link>
      </Button>
      <h1 className="text-2xl font-semibold text-center flex items-center justify-center gap-2">
        <Wrench className="h-6 w-6 text-primary" />
        Agregar Servicio de Frenos para <span className="text-primary">{vehicleName}</span>
      </h1>
      <BrakeServiceForm onSubmit={handleSubmit} submitButtonText="Agregar" />
    </div>
  );
}

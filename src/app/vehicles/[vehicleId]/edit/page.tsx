
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { VehicleForm } from '@/components/vehicle-form';
import { useVehicles } from '@/hooks/use-vehicles';
import type { Vehicle } from '@/lib/types';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.vehicleId as string;

  const { getVehicleById, updateVehicle } = useVehicles();
  const [vehicle, setVehicle] = useState<Vehicle | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    if (vehicleId) {
      const foundVehicle = getVehicleById(vehicleId);
      if (foundVehicle) {
        setVehicle(foundVehicle);
      } else {
        setError("Vehículo no encontrado.");
      }
    } else {
      setError("ID de vehículo no proporcionado.");
    }
    setIsLoading(false);
  }, [vehicleId, getVehicleById]);

  const handleSubmit = (data: Omit<Vehicle, 'id'>) => {
    if (!vehicleId) {
        setError("No se puede actualizar: ID de vehículo no encontrado.");
        return;
    }
    updateVehicle({ ...data, id: vehicleId });
    router.push(`/vehicles/${vehicleId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" /> 
        <Skeleton className="h-10 w-1/3 mb-4" /> 
        <Skeleton className="h-96 w-full max-w-lg mx-auto" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold text-destructive mb-4">{error}</h1>
        <p className="text-muted-foreground mb-6">Por favor, revisa la URL o vuelve a la lista de vehículos.</p>
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

  if (!vehicle) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold text-destructive mb-4">No se pudieron cargar los datos del vehículo.</h1>
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
        <Pencil className="h-6 w-6 text-primary" />
        Editar Vehículo: <span className="text-primary">{vehicle.make} {vehicle.model}</span>
      </h1>
      <VehicleForm 
        onSubmit={handleSubmit} 
        initialData={vehicle} 
        submitButtonText="Actualizar" 
      />
    </div>
  );
}

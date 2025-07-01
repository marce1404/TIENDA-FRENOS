
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

export default function EditBrakeServicePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.vehicleId as string;
  const brakeServiceId = params.brakeServiceId as string;
  
  const { getVehicleById } = useVehicles();
  const { getBrakeServiceById, updateBrakeService } = useBrakeServices(vehicleId);

  const [vehicleName, setVehicleName] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Partial<BrakeServiceRecord> | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    if (vehicleId && brakeServiceId) {
      const vehicle = getVehicleById(vehicleId);
      if (vehicle) {
        setVehicleName(`${vehicle.year} ${vehicle.make} ${vehicle.model}`);
        const brakeServiceRecord = getBrakeServiceById(brakeServiceId);
        if (brakeServiceRecord) {
          const [year, month, day] = brakeServiceRecord.date.split('-').map(Number);
          const parsedDate = new Date(year, month - 1, day);
          
          setInitialData({
            ...brakeServiceRecord,
            date: parsedDate,
          });
        } else {
          setError("Registro de servicio de frenos no encontrado.");
        }
      } else {
        setError("Vehículo no encontrado.");
      }
      setIsLoading(false);
    } else {
      setError("Información insuficiente para editar el registro.");
      setIsLoading(false);
    }
  }, [vehicleId, brakeServiceId, getVehicleById, getBrakeServiceById]);

  const handleSubmit = (data: Omit<BrakeServiceRecord, 'id' | 'vehicleId'>) => {
    updateBrakeService(brakeServiceId, data);
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
  
  if (error) {
     return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold text-destructive mb-4">{error}</h1>
        <p className="text-muted-foreground mb-6">Por favor, revisa la URL o vuelve a la lista de vehículos.</p>
        <Button asChild variant="outline">
          <Link href={vehicleId ? `/vehicles/${vehicleId}` : '/'}>
            <span>
              <ArrowLeft className="mr-2 h-4 w-4" /> {vehicleId ? 'Volver a Detalles' : 'Volver a Inicio'}
            </span>
          </Link>
        </Button>
      </div>
    );
  }
  
  if (!initialData) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold text-destructive mb-4">No se pudieron cargar los datos del servicio de frenos.</h1>
         <Button asChild variant="outline">
          <Link href={vehicleId ? `/vehicles/${vehicleId}` : '/'}>
            <span>
              <ArrowLeft className="mr-2 h-4 w-4" /> {vehicleId ? 'Volver a Detalles' : 'Volver a Inicio'}
            </span>
          </Link>
        </Button>
      </div>
    )
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
        Editar Servicio de Frenos para <span className="text-primary">{vehicleName}</span>
      </h1>
      <BrakeServiceForm 
        onSubmit={handleSubmit} 
        initialData={initialData} 
        submitButtonText="Actualizar" 
      />
    </div>
  );
}

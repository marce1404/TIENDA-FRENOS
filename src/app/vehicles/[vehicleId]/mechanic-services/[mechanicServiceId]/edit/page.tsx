
"use client";

import { MechanicServiceForm } from '@/components/mechanic-service-form';
import { useMechanicServices } from '@/hooks/use-mechanic-services';
import { useVehicles } from '@/hooks/use-vehicles';
import { useRouter, useParams } from 'next/navigation';
import type { MechanicServiceRecord } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Cog } from 'lucide-react'; 

export async function generateStaticParams() {
  return [];
}

export default function EditMechanicServicePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.vehicleId as string;
  const mechanicServiceId = params.mechanicServiceId as string;
  
  const { getVehicleById } = useVehicles();
  const { getMechanicServiceById, updateMechanicService } = useMechanicServices(vehicleId);

  const [vehicleName, setVehicleName] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Partial<MechanicServiceRecord> | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    if (vehicleId && mechanicServiceId) {
      const vehicle = getVehicleById(vehicleId);
      if (vehicle) {
        setVehicleName(`${vehicle.year} ${vehicle.make} ${vehicle.model}`);
        const serviceRecord = getMechanicServiceById(mechanicServiceId);
        if (serviceRecord) {
          const [year, month, day] = serviceRecord.date.split('-').map(Number);
          const parsedDate = new Date(year, month - 1, day);
          
          setInitialData({
            ...serviceRecord,
            date: parsedDate,
          });
        } else {
          setError("Registro de servicio de mecánica no encontrado.");
        }
      } else {
        setError("Vehículo no encontrado.");
      }
      setIsLoading(false);
    } else {
      setError("Información insuficiente para editar el registro.");
      setIsLoading(false);
    }
  }, [vehicleId, mechanicServiceId, getVehicleById, getMechanicServiceById]);

  const handleSubmit = (data: Omit<MechanicServiceRecord, 'id' | 'vehicleId'>) => {
    updateMechanicService(mechanicServiceId, data);
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
        <h1 className="text-2xl font-semibold text-destructive mb-4">No se pudieron cargar los datos del servicio de mecánica.</h1>
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
        <Cog className="h-6 w-6 text-primary" /> 
        Editar Servicio de Mecánica para <span className="text-primary">{vehicleName}</span>
      </h1>
      <MechanicServiceForm 
        onSubmit={handleSubmit} 
        initialData={initialData} 
        submitButtonText="Actualizar" 
      />
    </div>
  );
}

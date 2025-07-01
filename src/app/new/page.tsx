
"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { VehicleForm } from '@/components/vehicle-form';
import { useVehicles } from '@/hooks/use-vehicles';
import type { Vehicle } from '@/lib/types';
import { ArrowLeft, Car } from 'lucide-react';

export default function NewVehiclePage() {
  const router = useRouter();
  const { addVehicle } = useVehicles();

  const handleSubmit = (data: Omit<Vehicle, 'id'>) => {
    addVehicle(data);
    router.push('/');
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild className="mb-4">
        <Link href="/">
          <span>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Lista
          </span>
        </Link>
      </Button>
      <h1 className="text-2xl font-semibold text-center flex items-center justify-center gap-2">
        <Car className="h-6 w-6 text-primary" />
        Agregar Nuevo Vehículo
      </h1>
      <VehicleForm onSubmit={handleSubmit} submitButtonText="Agregar Vehículo" />
    </div>
  );
}

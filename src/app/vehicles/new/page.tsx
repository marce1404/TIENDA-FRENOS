
"use client";

import { VehicleForm } from '@/components/vehicle-form';
import { useVehicles } from '@/hooks/use-vehicles';
import { useRouter } from 'next/navigation';
import type { Vehicle } from '@/lib/types';

export default function AddVehiclePage() {
  const router = useRouter();
  const { addVehicle } = useVehicles();

  const handleSubmit = (data: Omit<Vehicle, 'id'>) => {
    const newVehicle = addVehicle(data);
    router.push(`/vehicles/${newVehicle.id}`);
  };

  return (
    <div className="space-y-6">
      <VehicleForm onSubmit={handleSubmit} submitButtonText="Agregar" />
    </div>
  );
}

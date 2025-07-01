
"use client";

import type { Vehicle } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const VEHICLES_STORAGE_KEY = 'oilChangeApp_vehicles';
const OIL_CHANGES_PREFIX = 'oilChangeApp_oilChanges_';
const BRAKE_SERVICES_PREFIX = 'oilChangeApp_brakeServices_';
const MECHANIC_SERVICES_PREFIX = 'oilChangeApp_mechanicServices_';

export function useVehicles() {
  const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>(VEHICLES_STORAGE_KEY, []);
  const { toast } = useToast();

  const addVehicle = useCallback((vehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle = { ...vehicleData, id: uuidv4() };
    setVehicles(prev => [...prev, newVehicle]);
    toast({ title: "Vehículo Agregado", description: `${newVehicle.make} ${newVehicle.model} ha sido agregado.` });
  }, [setVehicles, toast]);
  
  const getVehicleById = useCallback((id: string): Vehicle | null | undefined => {
    // This function can remain synchronous if 'vehicles' is guaranteed to be up-to-date
    // from the useLocalStorage hook.
    return vehicles.find(v => v.id === id);
  }, [vehicles]);


  const updateVehicle = useCallback((updatedVehicle: Vehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
    toast({ title: "Vehículo Actualizado", description: "Los datos del vehículo han sido guardados." });
  }, [setVehicles, toast]);

  const deleteVehicle = useCallback((id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    // Also remove associated service records
    localStorage.removeItem(`${OIL_CHANGES_PREFIX}${id}`);
    localStorage.removeItem(`${BRAKE_SERVICES_PREFIX}${id}`);
    localStorage.removeItem(`${MECHANIC_SERVICES_PREFIX}${id}`);
    toast({ variant: 'destructive', title: "Vehículo Eliminado", description: "El vehículo y todos sus registros han sido eliminados." });
  }, [setVehicles, toast]);
  
  return { vehicles, addVehicle, getVehicleById, updateVehicle, deleteVehicle };
}

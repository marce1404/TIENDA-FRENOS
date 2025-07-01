
"use client";

import type { Vehicle } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

const VEHICLES_STORAGE_KEY = 'oilChangeApp_vehicles';

export function useVehicles() {
  const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>(VEHICLES_STORAGE_KEY, []);
  const { toast } = useToast();

  const addVehicle = useCallback((newVehicleData: Omit<Vehicle, 'id'>) => {
    const vehicleWithId: Vehicle = { ...newVehicleData, id: crypto.randomUUID() };
    setVehicles(prev => [...prev, vehicleWithId].sort((a,b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`)));
    toast({ title: "Vehículo Agregado", description: `${vehicleWithId.make} ${vehicleWithId.model} ha sido agregado.` });
    return vehicleWithId;
  }, [setVehicles, toast]);

  const getVehicleById = useCallback((id: string | undefined): Vehicle | undefined => {
    if (!id) return undefined;
    // Re-fetch from localStorage directly to ensure latest data if other tabs modified it
    // Or rely on the hook's own synchronization if sufficient. For now, direct access:
    const currentVehicles: Vehicle[] = JSON.parse(window.localStorage.getItem(VEHICLES_STORAGE_KEY) || '[]');
    return currentVehicles.find(v => v.id === id);
  }, []); // vehicles dependency removed to avoid stale closure if vehicles array is updated elsewhere.

  const updateVehicle = useCallback((updatedVehicle: Vehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v).sort((a,b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`)));
    toast({ title: "Vehículo Actualizado", description: `${updatedVehicle.make} ${updatedVehicle.model} ha sido actualizado.` });
  }, [setVehicles, toast]);

  const deleteVehicle = useCallback((id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    toast({ title: "Vehículo Eliminado", description: "El vehículo ha sido eliminado." });
  }, [setVehicles, toast]);

  // Expose setVehicles for direct manipulation if needed after import, though reload handles it now
  return { vehicles, addVehicle, getVehicleById, updateVehicle, deleteVehicle, setVehicles };
}

    

"use client";

import type { MechanicServiceRecord } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCallback } from 'react';

const MECHANIC_SERVICES_STORAGE_KEY_PREFIX = 'oilChangeApp_mechanicServices_';

// Helper to parse "YYYY-MM-DD" string to a local Date object
const parseDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export function useMechanicServices(vehicleId?: string) {
  const storageKey = vehicleId ? `${MECHANIC_SERVICES_STORAGE_KEY_PREFIX}${vehicleId}` : '';
  const [mechanicServices, setMechanicServices] = useLocalStorage<MechanicServiceRecord[]>(storageKey, []);
  const { toast } = useToast();

  const addMechanicService = useCallback((newMechanicServiceData: Omit<MechanicServiceRecord, 'id' | 'vehicleId'>) => {
    if (!vehicleId) {
      toast({ variant: "destructive", title: "Error", description: "Falta el ID del vehículo." });
      return;
    }
    const serviceWithIds: MechanicServiceRecord = {
      ...newMechanicServiceData,
      id: crypto.randomUUID(),
      vehicleId
    };
    setMechanicServices(prev => [...prev, serviceWithIds].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    const displayDate = parseDateString(newMechanicServiceData.date);
    toast({ title: "Servicio de Mecánica Registrado", description: `El servicio del ${format(displayDate, "PPP", { locale: es })} ha sido agregado.` });
    return serviceWithIds;
  }, [vehicleId, setMechanicServices, toast]);

  const getMechanicServicesByVehicleId = useCallback((id: string): MechanicServiceRecord[] => {
    if (vehicleId === id) {
      return mechanicServices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    try {
      const itemKey = `${MECHANIC_SERVICES_STORAGE_KEY_PREFIX}${id}`;
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(itemKey) : null;
      return item ? JSON.parse(item).sort((a: MechanicServiceRecord, b: MechanicServiceRecord) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
    } catch (error) {
      console.error(`Error reading mechanic services for vehicle ${id}:`, error);
      return [];
    }
  }, [mechanicServices, vehicleId]);

  const getMechanicServiceById = useCallback((serviceId: string): MechanicServiceRecord | undefined => {
    if (!vehicleId) return undefined;
    const itemKey = `${MECHANIC_SERVICES_STORAGE_KEY_PREFIX}${vehicleId}`;
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(itemKey) : null;
      const currentServices: MechanicServiceRecord[] = item ? JSON.parse(item) : [];
      return currentServices.find(s => s.id === serviceId);
    } catch (error) {
      console.error(`Error reading mechanic service ${serviceId} for vehicle ${vehicleId}:`, error);
      return undefined;
    }
  }, [vehicleId]);

  const updateMechanicService = useCallback((id: string, updatedData: Omit<MechanicServiceRecord, 'id' | 'vehicleId'>) => {
    if (!vehicleId) {
      toast({ variant: "destructive", title: "Error", description: "Falta el ID del vehículo para actualizar." });
      return;
    }
    setMechanicServices(prev =>
      prev.map(s =>
        s.id === id ? { ...s, ...updatedData } : s
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    
    const displayDate = parseDateString(updatedData.date);
    toast({ title: "Servicio de Mecánica Actualizado", description: `El registro del ${format(displayDate, "PPP", { locale: es })} ha sido actualizado.` });
  }, [vehicleId, setMechanicServices, toast]);

  const deleteMechanicService = useCallback((id: string) => {
    const serviceToDelete = mechanicServices.find(s => s.id === id);
    setMechanicServices(prev => prev.filter(s => s.id !== id));
    if (serviceToDelete) {
      const displayDate = parseDateString(serviceToDelete.date);
      toast({ title: "Servicio de Mecánica Eliminado", description: `El registro del ${format(displayDate, "PPP", { locale: es })} ha sido eliminado.` });
    } else {
       if (vehicleId) {
        const itemKey = `${MECHANIC_SERVICES_STORAGE_KEY_PREFIX}${vehicleId}`;
        const item = typeof window !== 'undefined' ? window.localStorage.getItem(itemKey) : null;
        if (item) {
            const currentServices: MechanicServiceRecord[] = JSON.parse(item);
            const deletedItemFromStorage = currentServices.find(s => s.id === id);
            if (deletedItemFromStorage) {
                const displayDate = parseDateString(deletedItemFromStorage.date);
                toast({ title: "Servicio de Mecánica Eliminado", description: `El registro del ${format(displayDate, "PPP", { locale: es })} ha sido eliminado.` });
                return;
            }
        }
      }
      toast({ title: "Servicio de Mecánica Eliminado", description: "El registro del servicio de mecánica ha sido eliminado." });
    }
  }, [mechanicServices, setMechanicServices, toast, vehicleId]);

  const deleteAllMechanicServicesForVehicle = useCallback((targetVehicleId: string) => {
    if (targetVehicleId === vehicleId) {
      setMechanicServices([]);
    }
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(`${MECHANIC_SERVICES_STORAGE_KEY_PREFIX}${targetVehicleId}`);
      }
    } catch (error) {
      console.error(`Error deleting all mechanic services for vehicle ${targetVehicleId}:`, error);
    }
  }, [vehicleId, setMechanicServices]);
  
  return { mechanicServices, addMechanicService, getMechanicServicesByVehicleId, getMechanicServiceById, updateMechanicService, deleteMechanicService, deleteAllMechanicServicesForVehicle };
}

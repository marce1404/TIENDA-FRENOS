
"use client";

import type { BrakeServiceRecord } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCallback } from 'react';

const BRAKE_SERVICES_STORAGE_KEY_PREFIX = 'oilChangeApp_brakeServices_';

// Helper to parse "YYYY-MM-DD" string to a local Date object
const parseDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export function useBrakeServices(vehicleId?: string) {
  const storageKey = vehicleId ? `${BRAKE_SERVICES_STORAGE_KEY_PREFIX}${vehicleId}` : '';
  const [brakeServices, setBrakeServices] = useLocalStorage<BrakeServiceRecord[]>(storageKey, []);
  const { toast } = useToast();

  const addBrakeService = useCallback((newBrakeServiceData: Omit<BrakeServiceRecord, 'id' | 'vehicleId'>) => {
    if (!vehicleId) {
      toast({ variant: "destructive", title: "Error", description: "Falta el ID del vehículo." });
      return;
    }
    const brakeServiceWithIds: BrakeServiceRecord = {
      ...newBrakeServiceData,
      id: crypto.randomUUID(),
      vehicleId
    };
    setBrakeServices(prev => [...prev, brakeServiceWithIds].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    const displayDate = parseDateString(newBrakeServiceData.date);
    toast({ title: "Servicio de Frenos Registrado", description: `El servicio de frenos del ${format(displayDate, "PPP", { locale: es })} ha sido agregado.` });
    return brakeServiceWithIds;
  }, [vehicleId, setBrakeServices, toast]);

  const getBrakeServicesByVehicleId = useCallback((id: string): BrakeServiceRecord[] => {
    if (vehicleId === id) {
      return brakeServices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    try {
      const itemKey = `${BRAKE_SERVICES_STORAGE_KEY_PREFIX}${id}`;
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(itemKey) : null;
      return item ? JSON.parse(item).sort((a: BrakeServiceRecord, b: BrakeServiceRecord) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
    } catch (error) {
      console.error(`Error reading brake services for vehicle ${id}:`, error);
      return [];
    }
  }, [brakeServices, vehicleId]);

  const getBrakeServiceById = useCallback((brakeServiceId: string): BrakeServiceRecord | undefined => {
    if (!vehicleId) return undefined;
    const itemKey = `${BRAKE_SERVICES_STORAGE_KEY_PREFIX}${vehicleId}`;
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(itemKey) : null;
      const currentBrakeServices: BrakeServiceRecord[] = item ? JSON.parse(item) : [];
      return currentBrakeServices.find(bs => bs.id === brakeServiceId);
    } catch (error) {
      console.error(`Error reading brake service ${brakeServiceId} for vehicle ${vehicleId}:`, error);
      return undefined;
    }
  }, [vehicleId]);

  const updateBrakeService = useCallback((id: string, updatedData: Omit<BrakeServiceRecord, 'id' | 'vehicleId'>) => {
    if (!vehicleId) {
      toast({ variant: "destructive", title: "Error", description: "Falta el ID del vehículo para actualizar." });
      return;
    }
    setBrakeServices(prev =>
      prev.map(bs =>
        bs.id === id ? { ...bs, ...updatedData } : bs
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    
    const displayDate = parseDateString(updatedData.date);
    toast({ title: "Servicio de Frenos Actualizado", description: `El registro del ${format(displayDate, "PPP", { locale: es })} ha sido actualizado.` });
  }, [vehicleId, setBrakeServices, toast]);

  const deleteBrakeService = useCallback((id: string) => {
    const brakeServiceToDelete = brakeServices.find(bs => bs.id === id); // Find from current state for toast
    setBrakeServices(prev => prev.filter(bs => bs.id !== id));
    if (brakeServiceToDelete) {
      const displayDate = parseDateString(brakeServiceToDelete.date);
      toast({ title: "Servicio de Frenos Eliminado", description: `El registro del ${format(displayDate, "PPP", { locale: es })} ha sido eliminado.` });
    } else {
      if (vehicleId) {
        const itemKey = `${BRAKE_SERVICES_STORAGE_KEY_PREFIX}${vehicleId}`;
        const item = typeof window !== 'undefined' ? window.localStorage.getItem(itemKey) : null;
        if (item) {
            const currentBrakeServices: BrakeServiceRecord[] = JSON.parse(item);
            const deletedItemFromStorage = currentBrakeServices.find(bs => bs.id === id);
            if (deletedItemFromStorage) {
                const displayDate = parseDateString(deletedItemFromStorage.date);
                toast({ title: "Servicio de Frenos Eliminado", description: `El registro del ${format(displayDate, "PPP", { locale: es })} ha sido eliminado.` });
                return;
            }
        }
      }
      toast({ title: "Servicio de Frenos Eliminado", description: "El registro del servicio de frenos ha sido eliminado." });
    }
  }, [brakeServices, setBrakeServices, toast, vehicleId]);

  const deleteAllBrakeServicesForVehicle = useCallback((targetVehicleId: string) => {
    if (targetVehicleId === vehicleId) {
      setBrakeServices([]);
    }
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(`${BRAKE_SERVICES_STORAGE_KEY_PREFIX}${targetVehicleId}`);
      }
    } catch (error) {
      console.error(`Error deleting all brake services for vehicle ${targetVehicleId}:`, error);
    }
  }, [vehicleId, setBrakeServices]);
  
  return { brakeServices, addBrakeService, getBrakeServicesByVehicleId, getBrakeServiceById, updateBrakeService, deleteBrakeService, deleteAllBrakeServicesForVehicle };
}

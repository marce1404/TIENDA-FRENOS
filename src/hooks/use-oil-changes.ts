
"use client";

import type { OilChangeRecord } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCallback } from 'react';

const OIL_CHANGES_STORAGE_KEY_PREFIX = 'oilChangeApp_oilChanges_';

// Helper to parse "YYYY-MM-DD" string to a local Date object
const parseDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export function useOilChanges(vehicleId?: string) {
  const storageKey = vehicleId ? `${OIL_CHANGES_STORAGE_KEY_PREFIX}${vehicleId}` : '';
  const [oilChanges, setOilChanges] = useLocalStorage<OilChangeRecord[]>(storageKey, []);
  const { toast } = useToast();

  const addOilChange = useCallback((newOilChangeData: Omit<OilChangeRecord, 'id' | 'vehicleId'>) => {
    if (!vehicleId) {
      toast({ variant: "destructive", title: "Error", description: "Falta el ID del vehículo." });
      return;
    }
    const oilChangeWithIds: OilChangeRecord = { 
      ...newOilChangeData, 
      id: crypto.randomUUID(), 
      vehicleId 
    };
    setOilChanges(prev => [...prev, oilChangeWithIds].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    const displayDate = parseDateString(newOilChangeData.date);
    toast({ title: "Cambio de Aceite Registrado", description: `El cambio de aceite del ${format(displayDate, "PPP", { locale: es })} ha sido agregado.` });
    return oilChangeWithIds;
  }, [vehicleId, setOilChanges, toast]);
  
  const getOilChangesByVehicleId = useCallback((id: string): OilChangeRecord[] => {
    // This function is less critical for edit pages, but for consistency, could also read from LS.
    // For now, it relies on the 'oilChanges' state if vehicleId matches, or direct LS read if not.
    if (vehicleId === id) {
      return oilChanges.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    try {
      const itemKey = `${OIL_CHANGES_STORAGE_KEY_PREFIX}${id}`;
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(itemKey) : null;
      return item ? JSON.parse(item).sort((a: OilChangeRecord, b: OilChangeRecord) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
    } catch (error) {
      console.error(`Error reading oil changes for vehicle ${id}:`, error);
      return [];
    }
  }, [oilChanges, vehicleId]);

  const getOilChangeById = useCallback((oilChangeId: string): OilChangeRecord | undefined => {
    if (!vehicleId) return undefined;
    const itemKey = `${OIL_CHANGES_STORAGE_KEY_PREFIX}${vehicleId}`;
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(itemKey) : null;
      const currentOilChanges: OilChangeRecord[] = item ? JSON.parse(item) : [];
      return currentOilChanges.find(oc => oc.id === oilChangeId);
    } catch (error) {
      console.error(`Error reading oil change ${oilChangeId} for vehicle ${vehicleId}:`, error);
      return undefined;
    }
  }, [vehicleId]);

  const updateOilChange = useCallback((id: string, updatedData: Omit<OilChangeRecord, 'id' | 'vehicleId'>) => {
    if (!vehicleId) {
      toast({ variant: "destructive", title: "Error", description: "Falta el ID del vehículo para actualizar." });
      return;
    }
    setOilChanges(prev => 
      prev.map(oc => 
        oc.id === id ? { ...oc, ...updatedData, date: updatedData.date } : oc
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    
    const displayDate = parseDateString(updatedData.date);
    toast({ title: "Cambio de Aceite Actualizado", description: `El registro del ${format(displayDate, "PPP", { locale: es })} ha sido actualizado.` });
  }, [vehicleId, setOilChanges, toast]);

  const deleteOilChange = useCallback((id: string) => {
    const oilChangeToDelete = oilChanges.find(oc => oc.id === id); // Find from current state for toast message
    setOilChanges(prev => prev.filter(oc => oc.id !== id));
    if (oilChangeToDelete) {
      const displayDate = parseDateString(oilChangeToDelete.date);
      toast({ title: "Cambio de Aceite Eliminado", description: `El registro del ${format(displayDate, "PPP", { locale: es })} ha sido eliminado.` });
    } else {
      // Attempt to get date from LS for toast if not in current state (should be rare)
      if (vehicleId) {
        const itemKey = `${OIL_CHANGES_STORAGE_KEY_PREFIX}${vehicleId}`;
        const item = typeof window !== 'undefined' ? window.localStorage.getItem(itemKey) : null;
        if (item) {
            const currentOilChanges: OilChangeRecord[] = JSON.parse(item);
            const deletedItemFromStorage = currentOilChanges.find(oc => oc.id === id);
            if (deletedItemFromStorage) {
                const displayDate = parseDateString(deletedItemFromStorage.date);
                toast({ title: "Cambio de Aceite Eliminado", description: `El registro del ${format(displayDate, "PPP", { locale: es })} ha sido eliminado.` });
                return;
            }
        }
      }
      toast({ title: "Cambio de Aceite Eliminado", description: "El registro del cambio de aceite ha sido eliminado." });
    }
  }, [oilChanges, setOilChanges, toast, vehicleId]);
  
  const deleteAllOilChangesForVehicle = useCallback((targetVehicleId: string) => {
    if (targetVehicleId === vehicleId) { 
        setOilChanges([]); // Clear state if it's the current vehicle's changes
    }
    // Always remove from localStorage regardless of current vehicleId context of the hook
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(`${OIL_CHANGES_STORAGE_KEY_PREFIX}${targetVehicleId}`);
      }
    } catch (error) {
      console.error(`Error deleting all oil changes for vehicle ${targetVehicleId}:`, error);
    }
  }, [vehicleId, setOilChanges]);

  return { oilChanges, addOilChange, getOilChangesByVehicleId, getOilChangeById, updateOilChange, deleteOilChange, deleteAllOilChangesForVehicle };
}

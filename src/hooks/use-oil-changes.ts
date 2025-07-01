
"use client";

import type { OilChangeRecord } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const OIL_CHANGES_PREFIX = 'oilChangeApp_oilChanges_';

export function useOilChanges(vehicleId: string) {
  const storageKey = `${OIL_CHANGES_PREFIX}${vehicleId}`;
  const [oilChanges, setOilChanges] = useLocalStorage<OilChangeRecord[]>(storageKey, []);
  const { toast } = useToast();

  const addOilChange = useCallback((data: Omit<OilChangeRecord, 'id' | 'vehicleId'>) => {
    const newRecord = { ...data, id: uuidv4(), vehicleId };
    setOilChanges(prev => [...prev, newRecord]);
    toast({ title: "Registro Agregado", description: "Se ha añadido un nuevo cambio de aceite." });
  }, [vehicleId, setOilChanges, toast]);

  const getOilChangeById = useCallback((id: string) => {
    return oilChanges.find(oc => oc.id === id);
  }, [oilChanges]);

  const updateOilChange = useCallback((id: string, data: Omit<OilChangeRecord, 'id' | 'vehicleId'>) => {
    setOilChanges(prev => prev.map(oc => oc.id === id ? { ...oc, ...data } : oc));
    toast({ title: "Registro Actualizado", description: "El cambio de aceite ha sido actualizado." });
  }, [setOilChanges, toast]);

  const deleteOilChange = useCallback((id: string) => {
    setOilChanges(prev => prev.filter(oc => oc.id !== id));
    toast({ variant: 'destructive', title: "Registro Eliminado", description: "Se ha eliminado el cambio de aceite." });
  }, [setOilChanges, toast]);

  return { oilChanges, addOilChange, getOilChangeById, updateOilChange, deleteOilChange };
}


"use client";

import type { MechanicServiceRecord } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const MECHANIC_SERVICES_PREFIX = 'oilChangeApp_mechanicServices_';

export function useMechanicServices(vehicleId: string) {
  const storageKey = `${MECHANIC_SERVICES_PREFIX}${vehicleId}`;
  const [mechanicServices, setMechanicServices] = useLocalStorage<MechanicServiceRecord[]>(storageKey, []);
  const { toast } = useToast();

  const addMechanicService = useCallback((data: Omit<MechanicServiceRecord, 'id' | 'vehicleId'>) => {
    const newRecord = { ...data, id: uuidv4(), vehicleId };
    setMechanicServices(prev => [...prev, newRecord]);
    toast({ title: "Registro Agregado", description: "Se ha añadido un nuevo servicio de mecánica." });
  }, [vehicleId, setMechanicServices, toast]);

  const getMechanicServiceById = useCallback((id: string) => {
    return mechanicServices.find(ms => ms.id === id);
  }, [mechanicServices]);

  const updateMechanicService = useCallback((id: string, data: Omit<MechanicServiceRecord, 'id' | 'vehicleId'>) => {
    setMechanicServices(prev => prev.map(ms => ms.id === id ? { ...ms, ...data } : ms));
    toast({ title: "Registro Actualizado", description: "El servicio de mecánica ha sido actualizado." });
  }, [setMechanicServices, toast]);

  const deleteMechanicService = useCallback((id: string) => {
    setMechanicServices(prev => prev.filter(ms => ms.id !== id));
    toast({ variant: 'destructive', title: "Registro Eliminado", description: "Se ha eliminado el servicio de mecánica." });
  }, [setMechanicServices, toast]);

  return { mechanicServices, addMechanicService, getMechanicServiceById, updateMechanicService, deleteMechanicService };
}

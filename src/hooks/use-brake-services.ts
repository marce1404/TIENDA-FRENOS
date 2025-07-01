
"use client";

import type { BrakeServiceRecord } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const BRAKE_SERVICES_PREFIX = 'oilChangeApp_brakeServices_';

export function useBrakeServices(vehicleId: string) {
  const storageKey = `${BRAKE_SERVICES_PREFIX}${vehicleId}`;
  const [brakeServices, setBrakeServices] = useLocalStorage<BrakeServiceRecord[]>(storageKey, []);
  const { toast } = useToast();

  const addBrakeService = useCallback((data: Omit<BrakeServiceRecord, 'id' | 'vehicleId'>) => {
    const newRecord = { ...data, id: uuidv4(), vehicleId };
    setBrakeServices(prev => [...prev, newRecord]);
    toast({ title: "Registro Agregado", description: "Se ha añadido un nuevo servicio de frenos." });
  }, [vehicleId, setBrakeServices, toast]);

  const getBrakeServiceById = useCallback((id: string) => {
    return brakeServices.find(bs => bs.id === id);
  }, [brakeServices]);

  const updateBrakeService = useCallback((id: string, data: Omit<BrakeServiceRecord, 'id' | 'vehicleId'>) => {
    setBrakeServices(prev => prev.map(bs => bs.id === id ? { ...bs, ...data } : bs));
    toast({ title: "Registro Actualizado", description: "El servicio de frenos ha sido actualizado." });
  }, [setBrakeServices, toast]);

  const deleteBrakeService = useCallback((id: string) => {
    setBrakeServices(prev => prev.filter(bs => bs.id !== id));
    toast({ variant: 'destructive', title: "Registro Eliminado", description: "Se ha eliminado el servicio de frenos." });
  }, [setBrakeServices, toast]);

  return { brakeServices, addBrakeService, getBrakeServiceById, updateBrakeService, deleteBrakeService };
}

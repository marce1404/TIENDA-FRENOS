
"use client";

import type { WorkshopInfo } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

const WORKSHOP_INFO_STORAGE_KEY = 'oilChangeApp_workshopInfo';

export function useWorkshopInfo() {
  const [workshopInfo, setWorkshopInfo] = useLocalStorage<WorkshopInfo | null>(WORKSHOP_INFO_STORAGE_KEY, null);
  const { toast } = useToast();

  const saveWorkshopInfo = useCallback((info: WorkshopInfo) => {
    setWorkshopInfo(info);
    toast({ title: "Información del Taller Guardada", description: "Los datos de tu taller han sido actualizados." });
  }, [setWorkshopInfo, toast]);

  const getWorkshopInfo = useCallback((): WorkshopInfo | null => {
    // Directly read from localStorage to ensure the most current data,
    // though the hook should keep it in sync.
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(WORKSHOP_INFO_STORAGE_KEY) : null;
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error reading workshop info from localStorage:", error);
      return null;
    }
  }, []);


  return { workshopInfo, saveWorkshopInfo, getWorkshopInfo };
}

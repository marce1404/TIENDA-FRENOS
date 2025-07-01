
"use client";

import type { WorkshopInfo, Vehicle } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Briefcase, Home, Phone, Globe, ArrowLeft, UserPlus, Trash2, Users, Download, Upload } from 'lucide-react';
import { useWorkshopInfo } from '@/hooks/use-workshop-info';
import { useEffect, useState, useRef } from 'react'; // Added useRef
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast'; // Added useToast
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Added AlertDialog

const workshopInfoSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url({ message: "Por favor, ingresa una URL válida (ej. http://www.ejemplo.com)" }).optional().or(z.literal('')),
  technicians: z.array(z.string().min(1, "El nombre del técnico no puede estar vacío.")).optional(),
});

type WorkshopInfoFormValues = z.infer<typeof workshopInfoSchema>;

export function WorkshopInfoForm() {
  const { workshopInfo, saveWorkshopInfo } = useWorkshopInfo();
  const [newTechnicianName, setNewTechnicianName] = useState("");
  const { toast } = useToast(); // For import/export notifications

  const importFileInputRef = useRef<HTMLInputElement>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [fileToImport, setFileToImport] = useState<File | null>(null);

  const form = useForm<WorkshopInfoFormValues>({
    resolver: zodResolver(workshopInfoSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      website: "",
      technicians: [],
    },
  });

  useEffect(() => {
    if (workshopInfo) {
      form.reset({
        name: workshopInfo.name || "",
        address: workshopInfo.address || "",
        phone: workshopInfo.phone || "",
        website: workshopInfo.website || "",
        technicians: workshopInfo.technicians || [],
      });
    }
  }, [workshopInfo, form]);

  const handleFormSubmit = (values: WorkshopInfoFormValues) => {
    saveWorkshopInfo(values);
  };

  const addTechnician = () => {
    if (newTechnicianName.trim() === "") return;
    const currentTechnicians = form.getValues("technicians") || [];
    if (!currentTechnicians.includes(newTechnicianName.trim())) {
      form.setValue("technicians", [...currentTechnicians, newTechnicianName.trim()], { shouldValidate: true });
      setNewTechnicianName("");
    } else {
        form.setError("technicians", { type: "custom", message: "Este técnico ya existe." });
    }
  };

  const removeTechnician = (techNameToRemove: string) => {
    const currentTechnicians = form.getValues("technicians") || [];
    form.setValue("technicians", currentTechnicians.filter(tech => tech !== techNameToRemove), { shouldValidate: true });
  };

  // Import/Export Functions (moved from page.tsx)
  const handleExportData = () => {
    try {
      const currentVehicles = JSON.parse(localStorage.getItem('oilChangeApp_vehicles') || '[]') as Vehicle[];
      const oilChangesData: Record<string, any> = {};
      const brakeServicesData: Record<string, any> = {};
      const mechanicServicesData: Record<string, any> = {};

      currentVehicles.forEach((vehicle: Vehicle) => {
        oilChangesData[vehicle.id] = JSON.parse(localStorage.getItem(`oilChangeApp_oilChanges_${vehicle.id}`) || '[]');
        brakeServicesData[vehicle.id] = JSON.parse(localStorage.getItem(`oilChangeApp_brakeServices_${vehicle.id}`) || '[]');
        mechanicServicesData[vehicle.id] = JSON.parse(localStorage.getItem(`oilChangeApp_mechanicServices_${vehicle.id}`) || '[]');
      });
      
      const currentWorkshopInfo = JSON.parse(localStorage.getItem('oilChangeApp_workshopInfo') || '{}');


      const exportObject = {
        version: 3, // Increment version due to ownerName and workshopInfo inclusion
        exportedAt: new Date().toISOString(),
        data: {
          vehicles: currentVehicles,
          oilChanges: oilChangesData,
          brakeServices: brakeServicesData,
          mechanicServices: mechanicServicesData,
          workshopInfo: currentWorkshopInfo,
        }
      };

      const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `serapp_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Datos Exportados", description: "Se ha descargado un archivo de respaldo." });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({ variant: "destructive", title: "Error de Exportación", description: "No se pudieron exportar los datos." });
    }
  };

  const confirmImport = () => {
    if (!fileToImport) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedObject = JSON.parse(event.target?.result as string);
        
        const isValidV2Format = importedObject && importedObject.data && 
            Array.isArray(importedObject.data.vehicles) &&
            typeof importedObject.data.oilChanges === 'object' && 
            typeof importedObject.data.brakeServices === 'object' &&
            (importedObject.data.mechanicServices === undefined || typeof importedObject.data.mechanicServices === 'object');

        const isValidV3Format = isValidV2Format && (importedObject.data.workshopInfo === undefined || typeof importedObject.data.workshopInfo === 'object');

        if (isValidV3Format || isValidV2Format) {
          const keysToRemove = Object.keys(localStorage).filter(key => key.startsWith('oilChangeApp_'));
          keysToRemove.forEach(key => localStorage.removeItem(key));
          const serAppKeysToRemove = Object.keys(localStorage).filter(key => key.startsWith('serApp_')); // Legacy prefix if any
          serAppKeysToRemove.forEach(key => localStorage.removeItem(key));

          localStorage.setItem('oilChangeApp_vehicles', JSON.stringify(importedObject.data.vehicles));
          Object.entries(importedObject.data.oilChanges).forEach(([vehicleId, changes]) => {
            localStorage.setItem(`oilChangeApp_oilChanges_${vehicleId}`, JSON.stringify(changes));
          });
          Object.entries(importedObject.data.brakeServices).forEach(([vehicleId, services]) => {
            localStorage.setItem(`oilChangeApp_brakeServices_${vehicleId}`, JSON.stringify(services));
          });
          if (importedObject.data.mechanicServices) { 
            Object.entries(importedObject.data.mechanicServices).forEach(([vehicleId, services]) => {
              localStorage.setItem(`oilChangeApp_mechanicServices_${vehicleId}`, JSON.stringify(services));
            });
          }
          if (importedObject.data.workshopInfo && isValidV3Format) {
            localStorage.setItem('oilChangeApp_workshopInfo', JSON.stringify(importedObject.data.workshopInfo));
          } else {
             localStorage.removeItem('oilChangeApp_workshopInfo'); // Ensure clean state if importing older format
          }

          toast({ title: "Importación Exitosa", description: "Los datos han sido restaurados. La página se recargará." });
          
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast({ variant: "destructive", title: "Error de Importación", description: "El archivo no tiene el formato esperado." });
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error de Importación", description: "El archivo no es un JSON válido o está corrupto." });
        console.error("Error importing data:", error);
      }
      resetImportState();
    };
    reader.onerror = () => {
      toast({ variant: "destructive", title: "Error de Importación", description: "No se pudo leer el archivo."});
      resetImportState();
    }
    reader.readAsText(fileToImport);
  };

  const handleImportFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileToImport(file);
      setShowImportConfirm(true);
    }
  };

  const resetImportState = () => {
    setFileToImport(null);
    setShowImportConfirm(false);
    if (importFileInputRef.current) {
      importFileInputRef.current.value = ""; 
    }
  };

  return (
    <div className="space-y-6">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/">
            <span>
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </span>
          </Link>
        </Button>
        <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader>
            <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <CardTitle>Información del Taller</CardTitle>
            </div>
            <CardDescription>Ingresa o actualiza los datos de tu taller. Estos se usarán en los mensajes de WhatsApp.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="flex items-center gap-1"><Briefcase className="h-4 w-4"/>Nombre del Taller</FormLabel>
                    <FormControl>
                        <Input placeholder="Mi Taller Mecánico" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="flex items-center gap-1"><Home className="h-4 w-4"/>Dirección</FormLabel>
                    <FormControl>
                        <Input placeholder="Calle Falsa 123, Ciudad" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="flex items-center gap-1"><Phone className="h-4 w-4"/>Teléfono</FormLabel>
                    <FormControl>
                        <Input type="tel" placeholder="+56 2 1234 5678" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="flex items-center gap-1"><Globe className="h-4 w-4"/>Página Web</FormLabel>
                    <FormControl>
                        <Input type="url" placeholder="http://www.mitaller.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <Separator />
                
                <div>
                  <FormLabel className="flex items-center gap-1 mb-2"><Users className="h-4 w-4"/>Técnicos</FormLabel>
                  <div className="flex gap-2 mb-2">
                    <Input 
                      placeholder="Nombre del Técnico" 
                      value={newTechnicianName}
                      onChange={(e) => {
                        setNewTechnicianName(e.target.value);
                        form.clearErrors("technicians"); 
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTechnician();
                        }
                      }}
                    />
                    <Button type="button" onClick={addTechnician} variant="outline">
                      <UserPlus className="mr-2 h-4 w-4" /> Añadir
                    </Button>
                  </div>
                   {form.formState.errors.technicians && typeof form.formState.errors.technicians.message === 'string' && (
                     <p className="text-sm font-medium text-destructive">{form.formState.errors.technicians.message}</p>
                   )}
                  
                  <Controller
                    control={form.control}
                    name="technicians"
                    render={({ field }) => (
                      <div className="space-y-2 mt-2">
                        {(field.value || []).map((tech, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                            <Badge variant="secondary">{tech}</Badge>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeTechnician(tech)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                        {(field.value || []).length === 0 && (
                            <p className="text-sm text-muted-foreground">Aún no hay técnicos agregados.</p>
                        )}
                      </div>
                    )}
                  />
                </div>
                <Separator />
                <div>
                  <FormLabel className="flex items-center gap-1 mb-2 text-lg font-semibold">Gestión de Datos</FormLabel>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Button type="button" onClick={handleExportData} variant="outline" className="w-full sm:w-auto">
                      <Download className="mr-2 h-5 w-5" /> Exportar Datos
                    </Button>
                    <Button type="button" onClick={() => importFileInputRef.current?.click()} variant="outline" className="w-full sm:w-auto">
                      <Upload className="mr-2 h-5 w-5" /> Importar Datos
                    </Button>
                    <input 
                      type="file" 
                      ref={importFileInputRef} 
                      onChange={handleImportFileSelect} 
                      accept=".json" 
                      className="hidden" 
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full mt-6">
                <Save className="mr-2 h-4 w-4" /> Guardar Información
                </Button>
            </form>
            </Form>
        </CardContent>
        </Card>

        {showImportConfirm && (
          <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Importación de Datos</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de que quieres importar los datos desde el archivo seleccionado? 
                  <span className="font-semibold text-destructive"> Esto reemplazará todos los datos actuales en la aplicación.</span> Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={resetImportState}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmImport} className="bg-primary hover:bg-primary/90">
                  Sí, Importar y Reemplazar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
    </div>
  );
}

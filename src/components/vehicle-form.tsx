
"use client";

import type { Vehicle } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Save, Car } from 'lucide-react';
import { useEffect } from 'react';

const vehicleFormSchema = z.object({
  make: z.string().min(2, { message: "La marca debe tener al menos 2 caracteres." }),
  model: z.string().min(1, { message: "El modelo es requerido." }),
  year: z.string()
    .regex(/^\d{4}$/, { message: "El año debe ser de 4 dígitos." })
    .refine(val => parseInt(val) >= 1900 && parseInt(val) <= new Date().getFullYear() + 1, {
      message: "Por favor, ingresa un año válido."
    }),
  patente: z.string().min(6, { message: "La patente debe tener al menos 6 caracteres." }).max(10),
  ownerName: z.string().min(3, { message: "El nombre del propietario es requerido." }),
  ownerPhone: z.string().optional(),
  imageUrl: z.string().url({ message: "Por favor, ingresa una URL de imagen válida." }).optional().or(z.literal('')),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

interface VehicleFormProps {
  onSubmit: (data: Omit<Vehicle, 'id'>) => void;
  initialData?: Vehicle;
  submitButtonText?: string;
}

export function VehicleForm({ onSubmit, initialData, submitButtonText = "Guardar" }: VehicleFormProps) {
  
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      make: "",
      model: "",
      year: "",
      patente: "",
      ownerName: "",
      ownerPhone: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);
  
  const defaultTitle = initialData ? "Editar Vehículo" : "Agregar Vehículo";

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Car className="h-6 w-6 text-primary" />
          <CardTitle>{defaultTitle}</CardTitle>
        </div>
        <CardDescription>Completa los datos del vehículo a continuación.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <FormControl>
                        <Input placeholder="ej., Toyota" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <FormControl>
                        <Input placeholder="ej., Yaris" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Año</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="ej., 2022" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="patente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patente</FormLabel>
                      <FormControl>
                        <Input placeholder="ej., ABCD-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name="ownerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Propietario</FormLabel>
                  <FormControl>
                    <Input placeholder="ej., Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="ownerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono del Propietario (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="ej., +56912345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la Imagen (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/imagen.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              <Save className="mr-2 h-4 w-4" /> {submitButtonText}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


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
import { CarFront, Save, Phone, UserCircle } from 'lucide-react'; // Added UserCircle
import { useEffect } from 'react';

const vehicleFormSchema = z.object({
  make: z.string().min(2, { message: "La marca debe tener al menos 2 caracteres." }),
  model: z.string().min(1, { message: "El modelo es requerido." }),
  year: z.string()
    .min(4, { message: "El año debe tener 4 dígitos." })
    .max(4, { message: "El año debe tener 4 dígitos." })
    .regex(/^\d{4}$/, { message: "Formato de año inválido."}),
  patente: z.string().min(3, { message: "La patente debe tener al menos 3 caracteres." }).max(10, {message: "La patente puede tener como máximo 10 caracteres."}),
  ownerName: z.string().optional(), // New field for owner's name
  phoneNumber: z.string()
    .optional()
    .refine(val => !val || val === "+56" || /^\+569\d{8}$/.test(val), { 
      message: "Formato inválido. Usar +569XXXXXXXX (ej: +56912345678), o +56 (o vacío) para borrar."
    })
    .transform(val => (val === "+56" ? "" : val)),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

interface VehicleFormProps {
  onSubmit: (data: VehicleFormValues) => void;
  initialData?: Partial<Vehicle>;
  submitButtonText?: string;
}

export function VehicleForm({ onSubmit, initialData, submitButtonText }: VehicleFormProps) {
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      make: "",
      model: "",
      year: "",
      patente: "",
      ownerName: "", // Default for owner's name
      phoneNumber: "+56", 
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        make: initialData.make || "",
        model: initialData.model || "",
        year: initialData.year || "",
        patente: initialData.patente || "",
        ownerName: initialData.ownerName || "", // Set initial owner's name
        phoneNumber: initialData.phoneNumber || "+56",
      });
    }
  }, [initialData, form]);

  const defaultTitle = initialData?.id ? "Editar Vehículo" : "Agregar Vehículo";
  const currentSubmitButtonText = submitButtonText || (initialData?.id ? "Actualizar" : "Agregar");


  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CarFront className="h-6 w-6 text-primary" />
          <CardTitle>{defaultTitle}</CardTitle>
        </div>
        <CardDescription>Ingresa los detalles del vehículo a continuación.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <Input placeholder="ej., Camry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Año</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="ej., 2023" {...field} />
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
                    <Input placeholder="ej., AB123CD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ownerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <UserCircle className="h-4 w-4" /> Nombre del Propietario (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="ej., Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Phone className="h-4 w-4" /> Número de Celular (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="+56912345678" 
                      {...field} 
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value.length > 0 && !value.startsWith('+') && !value.startsWith('56')) {
                            value = '+56' + value.replace(/\D/g, '');
                        } else if (value.length > 0 && value.startsWith('56') && !value.startsWith('+56')) {
                            value = '+' + value.replace(/\D/g, '');
                        }
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              <Save className="mr-2 h-4 w-4" /> {currentSubmitButtonText}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

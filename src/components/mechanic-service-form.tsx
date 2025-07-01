
"use client";

import type { MechanicServiceRecord } from '@/lib/types';
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
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Added
import { CalendarIcon, Save, Cog, User } from 'lucide-react'; // Added User
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEffect } from 'react';
import { useWorkshopInfo } from '@/hooks/use-workshop-info'; // Added

const mechanicServiceFormSchema = z.object({
  date: z.date({ required_error: "La fecha del servicio es requerida." }),
  details: z.string().min(5, { message: "Los detalles deben tener al menos 5 caracteres." }),
  technicianName: z.string().optional(), // New field
});

type MechanicServiceFormValues = z.infer<typeof mechanicServiceFormSchema>;

interface MechanicServiceFormProps {
  onSubmit: (data: Omit<MechanicServiceRecord, 'id' | 'vehicleId'>) => void;
  initialData?: Partial<MechanicServiceRecord & { date: Date | string }>;
  submitButtonText?: string;
}

export function MechanicServiceForm({ onSubmit, initialData, submitButtonText }: MechanicServiceFormProps) {
  const { workshopInfo } = useWorkshopInfo();
  const technicians = workshopInfo?.technicians || [];

  const form = useForm<MechanicServiceFormValues>({
    resolver: zodResolver(mechanicServiceFormSchema),
    defaultValues: {
      date: new Date(),
      details: "",
      technicianName: "", // Default for new field
    },
  });

  useEffect(() => {
    if (initialData) {
      let dateToSet: Date;
      if (initialData.date) {
        if (initialData.date instanceof Date) {
          dateToSet = initialData.date;
        } else {
          const parts = String(initialData.date).split('-');
          if (parts.length === 3) {
            dateToSet = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          } else {
            dateToSet = new Date(initialData.date);
          }
        }
      } else {
        dateToSet = new Date();
      }

      form.reset({
        date: dateToSet,
        details: initialData.details || "",
        technicianName: initialData.technicianName || "", // Set initial technician
      });
    }
  }, [initialData, form]);

  const handleFormSubmit = (values: MechanicServiceFormValues) => {
    onSubmit({
      ...values,
      date: format(values.date, "yyyy-MM-dd"), 
    });
  };
  
  const defaultTitle = initialData?.id ? "Editar Servicio de Mecánica" : "Agregar Servicio de Mecánica";
  const currentSubmitButtonText = submitButtonText || (initialData?.id ? "Actualizar" : "Agregar");

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Cog className="h-6 w-6 text-primary" /> 
          <CardTitle>{defaultTitle}</CardTitle>
        </div>
        <CardDescription>Ingresa los detalles del servicio de mecánica a continuación.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha del Servicio</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Elige una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalles de Reparaciones Efectuadas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="ej., Se cambió correa de distribución, bomba de agua y tensor. Se ajustó freno de mano..." 
                      {...field} 
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {technicians.length > 0 && (
              <FormField
                control={form.control}
                name="technicianName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><User className="h-4 w-4"/>Técnico Asignado (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar técnico..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* <SelectItem value="">No asignado</SelectItem> Removed to prevent error */}
                        {technicians.map((tech) => (
                          <SelectItem key={tech} value={tech}>
                            {tech}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" className="w-full">
              <Save className="mr-2 h-4 w-4" /> {currentSubmitButtonText}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

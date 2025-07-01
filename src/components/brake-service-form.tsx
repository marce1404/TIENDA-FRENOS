
"use client";

import type { BrakeServiceRecord } from '@/lib/types';
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
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Added
import { CalendarIcon, Save, Wrench, Replace, Disc3, Layers, Droplets, Scaling, Repeat, User } from 'lucide-react'; // Added User
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEffect } from 'react';
import { useWorkshopInfo } from '@/hooks/use-workshop-info'; // Added

const brakeServiceFormSchema = z.object({
  date: z.date({ required_error: "La fecha del servicio es requerida." }),
  mileage: z.string().min(1, { message: "El kilometraje es requerido." }).regex(/^\d+$/, { message: "El kilometraje debe ser un número." }),
  padChange: z.boolean().default(false),
  padModel: z.string().optional(),
  discRectification: z.boolean().default(false),
  brakeShoes: z.boolean().default(false), 
  brakeFluidChange: z.boolean().default(false),
  alignment: z.boolean().default(false),
  balancing: z.boolean().default(false),
  notes: z.string().optional(),
  technicianName: z.string().optional(), // New field
}).refine(data => {
    if (data.padChange && (!data.padModel || data.padModel.trim() === "")) {
        return false;
    }
    return true;
}, {
    message: "El modelo de pastillas es requerido si se indica cambio de pastillas.",
    path: ["padModel"], 
});


type BrakeServiceFormValues = z.infer<typeof brakeServiceFormSchema>;

interface BrakeServiceFormProps {
  onSubmit: (data: Omit<BrakeServiceRecord, 'id' | 'vehicleId'>) => void;
  initialData?: Partial<BrakeServiceRecord & { date: Date | string }>;
  submitButtonText?: string;
}

export function BrakeServiceForm({ onSubmit, initialData, submitButtonText }: BrakeServiceFormProps) {
  const { workshopInfo } = useWorkshopInfo();
  const technicians = workshopInfo?.technicians || [];

  const form = useForm<BrakeServiceFormValues>({
    resolver: zodResolver(brakeServiceFormSchema),
    defaultValues: {
      date: new Date(),
      mileage: "",
      padChange: false,
      padModel: "",
      discRectification: false,
      brakeShoes: false,
      brakeFluidChange: false,
      alignment: false,
      balancing: false,
      notes: "",
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
        mileage: initialData.mileage || "",
        padChange: initialData.padChange || false,
        padModel: initialData.padModel || "",
        discRectification: initialData.discRectification || false,
        brakeShoes: initialData.brakeShoes || false,
        brakeFluidChange: initialData.brakeFluidChange || false,
        alignment: initialData.alignment || false,
        balancing: initialData.balancing || false,
        notes: initialData.notes || "",
        technicianName: initialData.technicianName || "", // Set initial technician
      });
    }
  }, [initialData, form]);

  const watchPadChange = form.watch("padChange");

  const handleFormSubmit = (values: BrakeServiceFormValues) => {
    onSubmit({
      ...values,
      date: format(values.date, "yyyy-MM-dd"), 
      padModel: values.padChange ? values.padModel : undefined,
    });
  };
  
  const defaultTitle = initialData?.id ? "Editar Servicio de Frenos" : "Agregar Servicio de Frenos";
  const currentSubmitButtonText = submitButtonText || (initialData?.id ? "Actualizar" : "Agregar");


  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          <CardTitle>{defaultTitle}</CardTitle>
        </div>
        <CardDescription>Ingresa los detalles del servicio de frenos a continuación.</CardDescription>
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
              name="mileage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kilometraje</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="ej., 75000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="padChange"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="flex items-center gap-2">
                      <Replace className="h-4 w-4 text-primary" /> Cambio de Pastillas
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {watchPadChange && (
              <FormField
                control={form.control}
                name="padModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo de Pastillas</FormLabel>
                    <FormControl>
                      <Input placeholder="ej., Brembo P23 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="discRectification"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <FormLabel className="text-sm font-normal flex items-center gap-1">
                        <Disc3 className="h-4 w-4 text-primary" /> Rectificado de Discos
                    </FormLabel>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="brakeShoes"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <FormLabel className="text-sm font-normal flex items-center gap-1">
                        <Layers className="h-4 w-4 text-primary" /> Balatas / Zapatas
                    </FormLabel>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="brakeFluidChange"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <FormLabel className="text-sm font-normal flex items-center gap-1">
                       <Droplets className="h-4 w-4 text-primary" /> Cambio Líquido Frenos
                    </FormLabel>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="alignment"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <FormLabel className="text-sm font-normal flex items-center gap-1">
                        <Scaling className="h-4 w-4 text-primary" /> Alineación
                    </FormLabel>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="balancing"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <FormLabel className="text-sm font-normal flex items-center gap-1">
                        <Repeat className="h-4 w-4 text-primary" /> Balanceo
                    </FormLabel>
                    </FormItem>
                )}
                />
            </div>

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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="ej., Se revisó también nivel de refrigerante. Ticket #12345" {...field} />
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

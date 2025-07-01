
"use client";

import type { BrakeServiceRecord } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    CalendarDays, Gauge, StickyNote, Trash2, Share2, Pencil, Wrench,
    Replace, Disc3, Layers, Droplets, Scaling, Repeat, User
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { useWorkshopInfo } from '@/hooks/use-workshop-info'; 

interface BrakeServiceHistoryItemProps {
  record: BrakeServiceRecord;
  onDelete: (id: string) => void;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehiclePatente: string;
  vehiclePhoneNumber?: string;
}

export function BrakeServiceHistoryItem({ 
  record, 
  onDelete, 
  vehicleMake, 
  vehicleModel, 
  vehicleYear, 
  vehiclePatente,
  vehiclePhoneNumber
}: BrakeServiceHistoryItemProps) {

  const { workshopInfo } = useWorkshopInfo(); 

  const handleShareWhatsApp = () => {
    const formattedDate = format(parseISO(record.date), "PPP", { locale: es });

    const workshopTitle = workshopInfo?.name ? `Registro de servicio de ${workshopInfo.name}` : "Registro de Servicio de Frenos";
    
    let message = `*${workshopTitle} para ${vehicleMake} ${vehicleModel} (${vehicleYear})*`;
    message += `\nPatente: ${vehiclePatente}`;
    message += `\n\nFecha: ${formattedDate}`;
    message += `\nKilometraje: ${record.mileage} km`;
    if (record.padChange) {
      message += `\n- Cambio de Pastillas: Sí`;
      if (record.padModel) {
        message += ` (Modelo: ${record.padModel})`;
      }
    }
    if (record.discRectification) message += `\n- Rectificado de Discos: Sí`;
    if (record.brakeShoes) message += `\n- Balatas/Zapatas: Sí`;
    if (record.brakeFluidChange) message += `\n- Cambio Líquido de Frenos: Sí`;
    if (record.alignment) message += `\n- Alineación: Sí`;
    if (record.balancing) message += `\n- Balanceo: Sí`;

    if (record.technicianName) {
      message += `\n\nTécnico: ${record.technicianName}`;
    }
    
    if (record.notes) {
      message += `\n\nObservaciones: ${record.notes}`;
    }

    if (workshopInfo?.name) {
      message += `\n\nAtentamente,\n${workshopInfo.name}`;
      if (workshopInfo.address) message += `\n${workshopInfo.address}`;
      if (workshopInfo.phone) message += `\nTel: ${workshopInfo.phone}`;
      if (workshopInfo.website) message += `\nWeb: ${workshopInfo.website}`;
    }

    let whatsappUrl = `https://wa.me/`;
    if (vehiclePhoneNumber) {
      const cleanPhoneNumber = vehiclePhoneNumber.replace(/\+/g, '').replace(/\s/g, '');
      whatsappUrl += `${cleanPhoneNumber}`;
    }
    whatsappUrl += `?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };
  
  const renderBooleanField = (label: string, value: boolean, IconComponent: React.ElementType) => {
    return (
        <div className="flex items-center gap-2 text-sm">
            <IconComponent className={`h-4 w-4 ${value ? 'text-green-500' : 'text-muted-foreground'}`} />
            <span>{label}:</span>
            <span className={value ? 'font-semibold text-green-600' : 'text-muted-foreground'}>{value ? 'Sí' : 'No'}</span>
        </div>
    );
  };


  return (
    <Card className="shadow-md mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Servicio de Frenos
            </CardTitle>
            <CardDescription>
              Registrado el {format(parseISO(record.date), "PPP", { locale: es })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-primary hover:bg-primary/10">
              <Link href={`/vehicles/${record.vehicleId}/brake-services/${record.id}/edit`}>
                <span>
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Editar registro</span>
                </span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShareWhatsApp} className="text-primary hover:bg-primary/10">
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Compartir en WhatsApp</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Eliminar registro</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar Registro de Servicio de Frenos?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Estás seguro de que quieres eliminar este registro de servicio de frenos del {format(parseISO(record.date), "PPP", { locale: es })}? Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(record.id)} className="bg-destructive hover:bg-destructive/90">
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Gauge className="h-4 w-4 text-muted-foreground" />
          <strong>Kilometraje:</strong> {record.mileage} km
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            {renderBooleanField("Cambio de Pastillas", record.padChange, Replace)}
            {record.padChange && record.padModel && (
                 <div className="flex items-center gap-2 text-sm md:col-span-2">
                    <span className="ml-6"><strong>Modelo Pastillas:</strong> {record.padModel}</span>
                 </div>
            )}
            {renderBooleanField("Rectificado de Discos", record.discRectification, Disc3)}
            {renderBooleanField("Balatas/Zapatas", record.brakeShoes, Layers)}
            {renderBooleanField("Cambio Líquido Frenos", record.brakeFluidChange, Droplets)}
            {renderBooleanField("Alineación", record.alignment, Scaling)}
            {renderBooleanField("Balanceo", record.balancing, Repeat)}
        </div>

         {record.technicianName && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <strong>Técnico:</strong> {record.technicianName}
          </div>
        )}

        {record.notes && (
          <div className="flex items-start gap-2 text-sm pt-2 border-t mt-3">
            <StickyNote className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
            <div>
              <strong>Observaciones:</strong>
              <p className="text-muted-foreground whitespace-pre-wrap">{record.notes}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

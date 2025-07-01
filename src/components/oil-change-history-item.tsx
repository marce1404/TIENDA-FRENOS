
"use client";

import type { OilChangeRecord } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays, Gauge, Filter, Droplet, StickyNote, Trash2, Share2, Pencil, User } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"
import { useWorkshopInfo } from '@/hooks/use-workshop-info'; 

interface OilChangeHistoryItemProps {
  record: OilChangeRecord;
  onDelete: (id: string) => void;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehiclePatente: string;
  vehiclePhoneNumber?: string;
}

export function OilChangeHistoryItem({ 
  record, 
  onDelete, 
  vehicleMake, 
  vehicleModel, 
  vehicleYear, 
  vehiclePatente,
  vehiclePhoneNumber
}: OilChangeHistoryItemProps) {

  const { workshopInfo } = useWorkshopInfo(); 

  const handleShareWhatsApp = () => {
    const formattedDate = format(parseISO(record.date), "PPP", { locale: es });
    
    const workshopTitle = workshopInfo?.name ? `Registro de servicio de ${workshopInfo.name}` : "Registro de Cambio de Aceite";

    let message = `*${workshopTitle} para ${vehicleMake} ${vehicleModel} (${vehicleYear})*`;
    message += `\nPatente: ${vehiclePatente}`;
    message += `\n\nFecha: ${formattedDate}`;
    message += `\nKilometraje: ${record.mileage} km`;
    message += `\nTipo de Aceite: ${record.oilType}`;
    message += `\nTipo de Filtro: ${record.filterType}`;

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
      // Remove '+' and spaces from phone number for the URL
      const cleanPhoneNumber = vehiclePhoneNumber.replace(/\+/g, '').replace(/\s/g, '');
      whatsappUrl += `${cleanPhoneNumber}`;
    }
    whatsappUrl += `?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="shadow-md mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Droplet className="h-5 w-5 text-primary" />
              Cambio de Aceite
            </CardTitle>
            <CardDescription>
              Registrado el {format(parseISO(record.date), "PPP", { locale: es })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-primary hover:bg-primary/10">
              <Link href={`/vehicles/${record.vehicleId}/oil-changes/${record.id}/edit`}>
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
                  <AlertDialogTitle>¿Eliminar Registro de Cambio de Aceite?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Estás seguro de que quieres eliminar este registro de cambio de aceite del {format(parseISO(record.date), "PPP", { locale: es })}? Esta acción no se puede deshacer.
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
        <div className="flex items-center gap-2 text-sm">
          <Droplet className="h-4 w-4 text-muted-foreground" />
          <strong>Tipo de Aceite:</strong> {record.oilType}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <strong>Tipo de Filtro:</strong> {record.filterType}
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

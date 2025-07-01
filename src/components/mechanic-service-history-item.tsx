
"use client";

import type { MechanicServiceRecord } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays, FileText, Trash2, Share2, Pencil, Cog, User } from 'lucide-react';
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
import { useWorkshopInfo } from '@/hooks/use-workshop-info';

interface MechanicServiceHistoryItemProps {
  record: MechanicServiceRecord;
  onDelete: (id: string) => void;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehiclePatente: string;
  vehiclePhoneNumber?: string;
}

export function MechanicServiceHistoryItem({ 
  record, 
  onDelete, 
  vehicleMake, 
  vehicleModel, 
  vehicleYear, 
  vehiclePatente,
  vehiclePhoneNumber
}: MechanicServiceHistoryItemProps) {

  const { workshopInfo } = useWorkshopInfo();

  const handleShareWhatsApp = () => {
    const formattedDate = format(parseISO(record.date), "PPP", { locale: es });
    const workshopTitle = workshopInfo?.name ? `Registro de servicio de ${workshopInfo.name}` : "Registro de Servicio de Mecánica";
    
    let message = `*${workshopTitle} para ${vehicleMake} ${vehicleModel} (${vehicleYear})*`;
    message += `\nPatente: ${vehiclePatente}`;
    message += `\n\nFecha: ${formattedDate}`;
    message += `\n\nDetalles de Reparación:`;
    message += `\n${record.details}`;

    if (record.technicianName) {
      message += `\n\nTécnico: ${record.technicianName}`;
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

  return (
    <Card className="shadow-md mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Cog className="h-5 w-5 text-primary" /> 
              Servicio de Mecánica
            </CardTitle>
            <CardDescription>
              Registrado el {format(parseISO(record.date), "PPP", { locale: es })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-primary hover:bg-primary/10">
              <Link href={`/vehicles/${record.vehicleId}/mechanic-services/${record.id}/edit`}>
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
                  <AlertDialogTitle>¿Eliminar Registro de Servicio de Mecánica?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Estás seguro de que quieres eliminar este registro de servicio de mecánica del {format(parseISO(record.date), "PPP", { locale: es })}? Esta acción no se puede deshacer.
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
        <div className="flex items-start gap-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
          <div>
            <strong>Detalles de Reparación:</strong>
            <p className="text-muted-foreground whitespace-pre-wrap">{record.details}</p>
          </div>
        </div>
         {record.technicianName && (
          <div className="flex items-center gap-2 text-sm mt-2 pt-2 border-t">
            <User className="h-4 w-4 text-muted-foreground" />
            <strong>Técnico:</strong> {record.technicianName}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { OilChangeHistoryItem } from '@/components/oil-change-history-item';
import { BrakeServiceHistoryItem } from '@/components/brake-service-history-item';
import { MechanicServiceHistoryItem } from '@/components/mechanic-service-history-item';
import { useVehicles } from '@/hooks/use-vehicles';
import { useOilChanges } from '@/hooks/use-oil-changes';
import { useBrakeServices } from '@/hooks/use-brake-services';
import { useMechanicServices } from '@/hooks/use-mechanic-services';
import type { Vehicle, OilChangeRecord, BrakeServiceRecord, MechanicServiceRecord } from '@/lib/types';
import { Car, Droplet, PlusCircle, ArrowLeft, Pencil, Trash2, BadgeInfo, Phone, Wrench, Cog, UserCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export async function generateStaticParams() {
  return [];
}

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.vehicleId as string;

  const { getVehicleById, deleteVehicle } = useVehicles();
  const { oilChanges, deleteOilChange, deleteAllOilChangesForVehicle } = useOilChanges(vehicleId);
  const { brakeServices, deleteBrakeService, deleteAllBrakeServicesForVehicle } = useBrakeServices(vehicleId);
  const { mechanicServices, deleteMechanicService, deleteAllMechanicServicesForVehicle } = useMechanicServices(vehicleId);
  
  const [vehicle, setVehicle] = useState<Vehicle | null | undefined>(undefined);

  useEffect(() => {
    if (vehicleId) {
      const foundVehicle = getVehicleById(vehicleId);
      setVehicle(foundVehicle);
    }
  }, [vehicleId, getVehicleById]);

  const handleDeleteVehicle = () => {
    if (vehicle) {
      deleteAllOilChangesForVehicle(vehicle.id);
      deleteAllBrakeServicesForVehicle(vehicle.id);
      deleteAllMechanicServicesForVehicle(vehicle.id);
      deleteVehicle(vehicle.id);
      router.push('/');
    }
  };
  
  const handleDeleteOilChange = (id: string) => {
    deleteOilChange(id);
  };

  const handleDeleteBrakeService = (id: string) => {
    deleteBrakeService(id);
  };

  const handleDeleteMechanicService = (id: string) => {
    deleteMechanicService(id);
  };

  if (vehicle === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-1/3 mt-1" />
            <Skeleton className="h-6 w-1/4 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Skeleton className="h-8 w-1/3 mb-2" />
        <div className="space-y-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-10">
        <Car className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold text-destructive mb-4">Vehículo No Encontrado</h1>
        <p className="text-muted-foreground mb-6">El vehículo que buscas no existe o ha sido eliminado.</p>
        <Button asChild variant="outline">
          <Link href="/">
            <span>
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Lista
            </span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center gap-2">
        <Button variant="outline" asChild>
          <Link href="/">
            <span>
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Lista
            </span>
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/vehicles/${vehicle.id}/edit`}>
              <span>
                <Pencil className="mr-2 h-4 w-4" /> Editar
              </span>
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente el
                  vehículo <span className="font-semibold">{vehicle.make} {vehicle.model} (Patente: {vehicle.patente})</span> y todos sus registros de servicios asociados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteVehicle} className="bg-destructive hover:bg-destructive/90">
                  Sí, eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/50 p-6">
          <div className="flex items-center gap-4">
            <Car className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl">{vehicle.make}</CardTitle>
              <CardDescription className="text-lg">Modelo: {vehicle.model} - Año: {vehicle.year}</CardDescription>
              <CardDescription className="text-md flex items-center gap-1">
                <BadgeInfo className="h-4 w-4" /> Patente: {vehicle.patente}
              </CardDescription>
              {vehicle.ownerName && (
                <CardDescription className="text-md flex items-center gap-1 mt-1">
                  <UserCircle className="h-4 w-4" /> Propietario: {vehicle.ownerName}
                </CardDescription>
              )}
              {vehicle.phoneNumber && (
                <CardDescription className="text-md flex items-center gap-1 mt-1">
                  <Phone className="h-4 w-4" /> Celular: {vehicle.phoneNumber}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Button asChild size="lg" className="w-full">
              <Link href={`/vehicles/${vehicle.id}/oil-changes/new`}>
                <span>
                  <PlusCircle className="mr-2 h-5 w-5" /> Añadir Aceite
                </span>
              </Link>
            </Button>
            <Button asChild size="lg" className="w-full" variant="secondary">
              <Link href={`/vehicles/${vehicle.id}/brake-services/new`}>
                <span>
                  <Wrench className="mr-2 h-5 w-5" /> Añadir Frenos
                </span>
              </Link>
            </Button>
            <Button asChild size="lg" className="w-full" variant="outline">
              <Link href={`/vehicles/${vehicle.id}/mechanic-services/new`}>
                <span>
                  <Cog className="mr-2 h-5 w-5" /> Añadir Mecánica
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="oilChanges" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="oilChanges" className="flex items-center gap-2">
            <Droplet className="h-5 w-5" /> Aceites
          </TabsTrigger>
          <TabsTrigger value="brakeServices" className="flex items-center gap-2">
            <Wrench className="h-5 w-5" /> Frenos
          </TabsTrigger>
          <TabsTrigger value="mechanicServices" className="flex items-center gap-2"> 
            <Cog className="h-5 w-5" /> Mecánica
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="oilChanges">
          {oilChanges.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-card mt-4">
              <Droplet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No se encontraron registros de cambios de aceite para este vehículo.</p>
              <Button asChild>
                  <Link href={`/vehicles/${vehicle.id}/oil-changes/new`}>
                  <span>
                      <PlusCircle className="mr-2 h-4 w-4" /> Añadir Aceite
                  </span>
                  </Link>
              </Button>
              </div>
          ) : (
              <div className="space-y-4 mt-4">
              {oilChanges.map((record) => (
                  <OilChangeHistoryItem 
                  key={record.id} 
                  record={record} 
                  onDelete={handleDeleteOilChange}
                  vehicleMake={vehicle.make}
                  vehicleModel={vehicle.model}
                  vehicleYear={vehicle.year}
                  vehiclePatente={vehicle.patente}
                  vehiclePhoneNumber={vehicle.phoneNumber}
                  />
              ))}
              </div>
          )}
        </TabsContent>
        <TabsContent value="brakeServices">
          {brakeServices.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-card mt-4">
              <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No se encontraron registros de servicios de frenos para este vehículo.</p>
              <Button asChild variant="secondary">
                  <Link href={`/vehicles/${vehicle.id}/brake-services/new`}>
                  <span>
                      <PlusCircle className="mr-2 h-4 w-4" /> Añadir Frenos
                  </span>
                  </Link>
              </Button>
              </div>
          ) : (
              <div className="space-y-4 mt-4">
              {brakeServices.map((record) => (
                  <BrakeServiceHistoryItem 
                  key={record.id} 
                  record={record} 
                  onDelete={handleDeleteBrakeService}
                  vehicleMake={vehicle.make}
                  vehicleModel={vehicle.model}
                  vehicleYear={vehicle.year}
                  vehiclePatente={vehicle.patente}
                  vehiclePhoneNumber={vehicle.phoneNumber}
                  />
              ))}
              </div>
          )}
        </TabsContent>
        <TabsContent value="mechanicServices"> 
          {mechanicServices.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-card mt-4">
              <Cog className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No se encontraron registros de servicios de mecánica para este vehículo.</p>
              <Button asChild variant="outline">
                  <Link href={`/vehicles/${vehicle.id}/mechanic-services/new`}>
                  <span>
                      <PlusCircle className="mr-2 h-4 w-4" /> Añadir Mecánica
                  </span>
                  </Link>
              </Button>
              </div>
          ) : (
              <div className="space-y-4 mt-4">
              {mechanicServices.map((record) => (
                  <MechanicServiceHistoryItem 
                  key={record.id} 
                  record={record} 
                  onDelete={handleDeleteMechanicService}
                  vehicleMake={vehicle.make}
                  vehicleModel={vehicle.model}
                  vehicleYear={vehicle.year}
                  vehiclePatente={vehicle.patente}
                  vehiclePhoneNumber={vehicle.phoneNumber}
                  />
              ))}
              </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

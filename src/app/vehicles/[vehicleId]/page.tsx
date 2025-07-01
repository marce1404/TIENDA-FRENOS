
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useVehicles } from '@/hooks/use-vehicles';
import { useOilChanges } from '@/hooks/use-oil-changes';
import { useBrakeServices } from '@/hooks/use-brake-services';
import { useMechanicServices } from '@/hooks/use-mechanic-services';
import type { Vehicle, OilChangeRecord, BrakeServiceRecord, MechanicServiceRecord } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
import { OilChangeHistoryItem } from '@/components/oil-change-history-item';
import { BrakeServiceHistoryItem } from '@/components/brake-service-history-item';
import { MechanicServiceHistoryItem } from '@/components/mechanic-service-history-item';
import { Car, Pencil, Trash2, ArrowLeft, Droplet, Wrench, Cog } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function VehicleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.vehicleId as string;

  const { getVehicleById, deleteVehicle } = useVehicles();
  const { oilChanges, deleteOilChange } = useOilChanges(vehicleId);
  const { brakeServices, deleteBrakeService } = useBrakeServices(vehicleId);
  const { mechanicServices, deleteMechanicService } = useMechanicServices(vehicleId);

  const [vehicle, setVehicle] = useState<Vehicle | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (vehicleId) {
      const foundVehicle = getVehicleById(vehicleId);
      setVehicle(foundVehicle);
    }
    setIsLoading(false);
  }, [vehicleId, getVehicleById]);

  const handleDeleteVehicle = () => {
    if (vehicleId) {
      deleteVehicle(vehicleId);
      router.push('/');
    }
  };

  const allServices = useMemo(() => {
    const combined = [
      ...oilChanges.map(o => ({ ...o, type: 'oil' as const, date: new Date(o.date) })),
      ...brakeServices.map(b => ({ ...b, type: 'brake' as const, date: new Date(b.date) })),
      ...mechanicServices.map(m => ({ ...m, type: 'mechanic' as const, date: new Date(m.date) })),
    ];
    return combined.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [oilChanges, brakeServices, mechanicServices]);


  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" /> 
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-1/3 mt-2" /></CardHeader>
            <CardContent><Skeleton className="h-32 w-full" /></CardContent>
        </Card>
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
            <CardContent><Skeleton className="h-24 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (vehicle === null) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold text-destructive mb-4">Vehículo no Encontrado</h1>
        <p className="text-muted-foreground mb-6">El vehículo que buscas no existe o ha sido eliminado.</p>
        <Button asChild variant="outline">
          <Link href="/">
            <span>
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la Lista
            </span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <Button variant="outline" asChild>
          <Link href="/">
            <span>
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Lista
            </span>
          </Link>
        </Button>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
                <Link href={`/vehicles/${vehicleId}/edit`} title="Editar Vehículo">
                    <span>
                        <Pencil className="h-5 w-5" />
                        <span className="sr-only">Editar Vehículo</span>
                    </span>
                </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" title="Eliminar Vehículo">
                  <Trash2 className="h-5 w-5" />
                  <span className="sr-only">Eliminar Vehículo</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar Vehículo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Estás seguro de que quieres eliminar el vehículo {vehicle?.make} {vehicle?.model}? Se eliminarán también todos sus historiales de servicio. Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteVehicle} className="bg-destructive hover:bg-destructive/90">
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
                <CardTitle className="text-2xl text-primary flex items-center gap-2">
                    <Car className="h-7 w-7"/> {vehicle.year} {vehicle.make} {vehicle.model}
                </CardTitle>
                <CardDescription>Patente: {vehicle.patente}</CardDescription>
                <CardDescription>Propietario: {vehicle.ownerName}</CardDescription>
                {vehicle.ownerPhone && <CardDescription>Teléfono: {vehicle.ownerPhone}</CardDescription>}
            </div>
             <div className="relative h-24 w-32 shrink-0">
                <Image 
                    src={vehicle.imageUrl || 'https://placehold.co/300x200.png'} 
                    alt={`${vehicle.make} ${vehicle.model}`}
                    fill
                    className="rounded-md object-cover border"
                    sizes="(max-width: 640px) 128px, 128px"
                    data-ai-hint="car side"
                    priority
                />
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <Separator />

      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-baseline gap-4 mb-4">
            <h2 className="text-xl font-semibold">Historial de Servicios</h2>
            <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="oil"><Droplet className="mr-1 h-4 w-4" />Aceite</TabsTrigger>
                <TabsTrigger value="brake"><Wrench className="mr-1 h-4 w-4" />Frenos</TabsTrigger>
                <TabsTrigger value="mechanic"><Cog className="mr-1 h-4 w-4" />Mecánica</TabsTrigger>
            </TabsList>
        </div>

        {/* --- ALL SERVICES TAB --- */}
        <TabsContent value="all">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                 <Button asChild>
                    <Link href={`/vehicles/${vehicleId}/oil-changes/new`}><Droplet className="mr-2 h-4 w-4"/>Añadir Cambio Aceite</Link>
                </Button>
                <Button asChild>
                    <Link href={`/vehicles/${vehicleId}/brake-services/new`}><Wrench className="mr-2 h-4 w-4"/>Añadir Servicio Freno</Link>
                </Button>
                <Button asChild>
                    <Link href={`/vehicles/${vehicleId}/mechanic-services/new`}><Cog className="mr-2 h-4 w-4"/>Añadir Servicio Mecánica</Link>
                </Button>
            </div>
            {allServices.length > 0 ? (
              allServices.map(service => {
                if (service.type === 'oil') {
                  return <OilChangeHistoryItem key={service.id} record={service as OilChangeRecord} onDelete={deleteOilChange} vehicleMake={vehicle.make} vehicleModel={vehicle.model} vehicleYear={vehicle.year} vehiclePatente={vehicle.patente} vehiclePhoneNumber={vehicle.ownerPhone} />;
                }
                if (service.type === 'brake') {
                  return <BrakeServiceHistoryItem key={service.id} record={service as BrakeServiceRecord} onDelete={deleteBrakeService} vehicleMake={vehicle.make} vehicleModel={vehicle.model} vehicleYear={vehicle.year} vehiclePatente={vehicle.patente} vehiclePhoneNumber={vehicle.ownerPhone} />;
                }
                if (service.type === 'mechanic') {
                  return <MechanicServiceHistoryItem key={service.id} record={service as MechanicServiceRecord} onDelete={deleteMechanicService} vehicleMake={vehicle.make} vehicleModel={vehicle.model} vehicleYear={vehicle.year} vehiclePatente={vehicle.patente} vehiclePhoneNumber={vehicle.ownerPhone} />;
                }
                return null;
              })
            ) : (
              <p className="text-center text-muted-foreground py-8">No hay servicios registrados para este vehículo.</p>
            )}
          </div>
        </TabsContent>

        {/* --- OIL CHANGES TAB --- */}
        <TabsContent value="oil">
          <div className="space-y-4">
             <Button asChild className="w-full md:w-auto">
                <Link href={`/vehicles/${vehicleId}/oil-changes/new`}><span><Droplet className="mr-2 h-4 w-4"/>Añadir Nuevo Cambio de Aceite</span></Link>
            </Button>
            {oilChanges.length > 0 ? (
                oilChanges.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                    <OilChangeHistoryItem key={record.id} record={record} onDelete={deleteOilChange} vehicleMake={vehicle.make} vehicleModel={vehicle.model} vehicleYear={vehicle.year} vehiclePatente={vehicle.patente} vehiclePhoneNumber={vehicle.ownerPhone} />
                ))
            ) : (
                <p className="text-center text-muted-foreground py-8">No hay cambios de aceite registrados.</p>
            )}
          </div>
        </TabsContent>
        
        {/* --- BRAKE SERVICES TAB --- */}
        <TabsContent value="brake">
            <div className="space-y-4">
                <Button asChild className="w-full md:w-auto">
                    <Link href={`/vehicles/${vehicleId}/brake-services/new`}><span><Wrench className="mr-2 h-4 w-4"/>Añadir Nuevo Servicio de Frenos</span></Link>
                </Button>
                {brakeServices.length > 0 ? (
                     brakeServices.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                        <BrakeServiceHistoryItem key={record.id} record={record} onDelete={deleteBrakeService} vehicleMake={vehicle.make} vehicleModel={vehicle.model} vehicleYear={vehicle.year} vehiclePatente={vehicle.patente} vehiclePhoneNumber={vehicle.ownerPhone} />
                    ))
                ) : (
                    <p className="text-center text-muted-foreground py-8">No hay servicios de frenos registrados.</p>
                )}
            </div>
        </TabsContent>

        {/* --- MECHANIC SERVICES TAB --- */}
        <TabsContent value="mechanic">
            <div className="space-y-4">
                <Button asChild className="w-full md:w-auto">
                    <Link href={`/vehicles/${vehicleId}/mechanic-services/new`}><span><Cog className="mr-2 h-4 w-4"/>Añadir Nuevo Servicio de Mecánica</span></Link>
                </Button>
                {mechanicServices.length > 0 ? (
                     mechanicServices.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                        <MechanicServiceHistoryItem key={record.id} record={record} onDelete={deleteMechanicService} vehicleMake={vehicle.make} vehicleModel={vehicle.model} vehicleYear={vehicle.year} vehiclePatente={vehicle.patente} vehiclePhoneNumber={vehicle.ownerPhone} />
                    ))
                ) : (
                    <p className="text-center text-muted-foreground py-8">No hay servicios de mecánica registrados.</p>
                )}
            </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}



export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  patente: string;
  ownerName: string;
  ownerPhone?: string;
  imageUrl?: string;
}

export interface OilChangeRecord {
  id: string;
  vehicleId: string;
  date: string; // YYYY-MM-DD
  mileage: string;
  oilType: string;
  filterType: string;
  notes?: string;
  technicianName?: string;
}

export interface BrakeServiceRecord {
  id: string;
  vehicleId: string;
  date: string; // YYYY-MM-DD
  mileage: string;
  padChange: boolean;
  padModel?: string;
  discRectification: boolean;
  brakeShoes: boolean;
  brakeFluidChange: boolean;
  alignment: boolean;
  balancing: boolean;
  notes?: string;
  technicianName?: string;
}

export interface MechanicServiceRecord {
  id: string;
  vehicleId: string;
  date: string; // YYYY-MM-DD
  details: string;
  technicianName?: string;
}

export interface WorkshopInfo {
  name?: string;
  address?: string;
  phone?: string;
  website?: string;
  technicians?: string[];
}

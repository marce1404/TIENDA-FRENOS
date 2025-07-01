
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string; // Year can be string to accommodate various formats or if validation is simple
  patente: string; // License Plate
  ownerName?: string; // New field for owner's name
  phoneNumber?: string; // Optional phone number for WhatsApp sharing
}

export interface OilChangeRecord {
  id: string;
  vehicleId: string;
  date: string; // ISO date string "yyyy-MM-dd"
  mileage: string; // Store as string to allow for units or formatting, parse to number for calculations
  oilType: string;
  filterType: string;
  notes?: string;
  technicianName?: string; 
}

export interface BrakeServiceRecord {
  id: string;
  vehicleId: string;
  date: string; // ISO date string "yyyy-MM-dd"
  mileage: string;
  padChange: boolean;
  padModel?: string;
  discRectification: boolean;
  brakeShoes: boolean; // Balatas
  brakeFluidChange: boolean;
  alignment: boolean;
  balancing: boolean;
  notes?: string;
  technicianName?: string; 
}

export interface MechanicServiceRecord {
  id: string;
  vehicleId: string;
  date: string; // ISO date string "yyyy-MM-dd"
  details: string; // Free-form text for repair details
  technicianName?: string; 
}

export interface WorkshopInfo {
  name?: string;
  address?: string;
  phone?: string;
  website?: string;
  technicians?: string[]; 
}

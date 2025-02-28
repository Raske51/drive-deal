export interface Car {
  id?: string;
  _id?: string; // Pour la rétrocompatibilité
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: 'essence' | 'diesel' | 'électrique' | 'hybride' | 'gpl';
  transmission: 'manuelle' | 'automatique';
  location: {
    city: string;
    postalCode: string;
    department: string;
  };
  description: string;
  features: string[];
  images: string[];
  source: {
    website: string;
    url: string;
    externalId: string;
  };
  seller: {
    type: 'particulier' | 'professionnel';
    name?: string;
    phone?: string;
  };
  technicalDetails: {
    power?: number; // en ch
    engineSize?: number; // en cm3
    doors?: number;
    seats?: number;
    color?: string;
    co2Emissions?: number; // en g/km
  };
  status: 'active' | 'sold' | 'pending';
  createdAt: Date;
  updatedAt: Date;
  lastScrapedAt: Date;
}

export interface CarSearchParams {
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
  fuel?: Car['fuel'][];
  transmission?: Car['transmission'][];
  location?: {
    city?: string;
    postalCode?: string;
    department?: string;
  };
  sellerType?: Car['seller']['type'][];
  sortBy?: 'price' | 'year' | 'mileage' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
} 
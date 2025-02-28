// Type definitions for services
import { Env } from '../types';

export interface CarListing {
  title: string;
  price: number;
  location: string;
  year?: number;
  mileage?: number;
  brand?: string;
  model?: string;
  fuel_type?: string;
  transmission?: string;
  image_url?: string;
  source_url: string;
  source: string;
  listing_id: string;
  scraped_at: string;
}

export function scrapeCarListings(
  params: { brand?: string; model?: string; minPrice?: string; maxPrice?: string; minYear?: string; maxYear?: string; sources?: string[] },
  env: Env
): Promise<{ listings: CarListing[]; sources: { [key: string]: { count: number; cacheHit: boolean } } }>; 
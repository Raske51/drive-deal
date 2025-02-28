export interface User {
  id: number;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface Car {
  id: number;
  title: string;
  description?: string;
  price: number;
  year: number;
  mileage: number;
  location: string;
  brand: string;
  model: string;
  fuel_type: string;
  transmission: string;
  image_url?: string;
  seller_id: number;
  created_at: string;
  updated_at: string;
}

export interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  JWT_SECRET: string;
}

export interface AuthRequest extends Request {
  user?: User;
}

// Ajout de l'interface ExecutionContext pour Cloudflare Workers
export interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
} 
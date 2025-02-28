interface Env {
  // KV Namespace
  SESSIONS: KVNamespace;
  
  // D1 database
  DB: D1Database;
  
  // Environment variables
  JWT_SECRET: string;
}

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  favorites: string[];
}

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  fuel: string;
  transmission: string;
  location: {
    department: string;
  };
  createdAt: string;
}

interface CarQuery {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuel?: string;
  transmission?: string;
  department?: string;
} 
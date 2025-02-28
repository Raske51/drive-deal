interface Env {
  JWT_SECRET: string;
  BUCKET: R2Bucket;
  DB: D1Database;
}

// Définition de l'interface User
interface User {
  id: number;
  email: string;
  password?: string;
  password_hash?: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
}

// Définition de l'interface Car
interface Car {
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
  created_at?: string;
  updated_at?: string;
}

// Database Functions
export async function listCars(query: any, env: Env) {
  let sql = 'SELECT * FROM cars WHERE 1=1';
  const params: any[] = [];

  if (query.make) {
    sql += ' AND make = ?';
    params.push(query.make);
  }
  if (query.model) {
    sql += ' AND model = ?';
    params.push(query.model);
  }
  if (query.minPrice) {
    sql += ' AND price >= ?';
    params.push(Number(query.minPrice));
  }
  if (query.maxPrice) {
    sql += ' AND price <= ?';
    params.push(Number(query.maxPrice));
  }

  const result = await env.DB.prepare(sql).bind(...params).all<Car>();
  return result.results || [];
}

// Helper Functions
export function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
} 
export interface User {
  _id?: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  favorites?: string[]; // IDs des voitures favorites
  alerts?: {
    criteria: object;
    frequency: 'daily' | 'weekly';
    active: boolean;
  }[];
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  favorites?: string[];
  alerts?: {
    id: string;
    criteria: object;
    frequency: 'daily' | 'weekly';
    active: boolean;
  }[];
} 
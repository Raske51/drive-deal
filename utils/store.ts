// Temporary in-memory store for development
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  favorites: string[];
}

export interface Car {
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
  createdAt: Date;
}

interface Store {
  users: User[];
  cars: Car[];
}

// Initial store data
const store: Store = {
  users: [
    {
      id: '1',
      email: 'dev@example.com',
      password: 'password123',
      name: 'Dev User',
      favorites: []
    }
  ],
  cars: [
    {
      id: '1',
      make: 'Renault',
      model: 'Clio',
      year: 2020,
      price: 15000,
      fuel: 'Essence',
      transmission: 'Manuelle',
      location: {
        department: '75'
      },
      createdAt: new Date('2024-01-01')
    }
  ]
};

// User functions
export function findUserByEmail(email: string): User | undefined {
  return store.users.find(user => user.email === email);
}

export function createUser(data: Omit<User, 'id' | 'favorites'>): User {
  const newUser: User = {
    id: (store.users.length + 1).toString(),
    ...data,
    favorites: []
  };
  store.users.push(newUser);
  return newUser;
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
  'location.department'?: string;
}

// Car functions
export function findCars(query: CarQuery): Car[] {
  return store.cars.filter(car => {
    if (query.minPrice && car.price < query.minPrice) return false;
    if (query.maxPrice && car.price > query.maxPrice) return false;
    if (query.minYear && car.year < query.minYear) return false;
    if (query.maxYear && car.year > query.maxYear) return false;
    if (query.make && car.make !== query.make) return false;
    if (query.model && car.model !== query.model) return false;
    if (query.fuel && car.fuel !== query.fuel) return false;
    if (query.transmission && car.transmission !== query.transmission) return false;
    if (query['location.department'] && car.location.department !== query['location.department']) return false;
    return true;
  });
}

// Favorites functions
export function getUserFavorites(userId: string): Car[] {
  const user = store.users.find(u => u.id === userId);
  if (!user) return [];
  return store.cars.filter(car => user.favorites.includes(car.id));
}

export function addToFavorites(userId: string, carId: string): void {
  const userIndex = store.users.findIndex(u => u.id === userId);
  if (userIndex === -1) return;
  if (!store.users[userIndex].favorites.includes(carId)) {
    store.users[userIndex].favorites.push(carId);
  }
}

export function removeFromFavorites(userId: string, carId: string): void {
  const userIndex = store.users.findIndex(u => u.id === userId);
  if (userIndex === -1) return;
  store.users[userIndex].favorites = store.users[userIndex].favorites.filter(id => id !== carId);
} 
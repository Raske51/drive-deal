import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Car } from '../../models/Car';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';

interface CarCardProps {
  car: Car;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

export default function CarCard({ car, isFavorite = false, onFavoriteToggle }: CarCardProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  const handleFavoriteClick = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour ajouter des favoris');
      return;
    }

    try {
      setIsLoading(true);
      if (isFavorite) {
        await axios.delete('/api/favorites', { data: { carId: car._id } });
        toast.success('Retiré des favoris');
      } else {
        await axios.post('/api/favorites', { carId: car._id });
        toast.success('Ajouté aux favoris');
      }
      onFavoriteToggle?.();
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Image */}
      <div className="relative h-48">
        {car.images.length > 0 ? (
          <Image
            src={car.images[0]}
            alt={car.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <button
          onClick={handleFavoriteClick}
          disabled={isLoading}
          className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className={`w-6 h-6 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Contenu */}
      <div className="p-4">
        <Link href={`/cars/${car._id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {car.title}
          </h3>
          <p className="text-2xl font-bold text-blue-600 mb-2">
            {formatPrice(car.price)}
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
            <div>
              <span className="font-medium">Année :</span> {car.year}
            </div>
            <div>
              <span className="font-medium">Kilométrage :</span> {car.mileage.toLocaleString('fr-FR')} km
            </div>
            <div>
              <span className="font-medium">Carburant :</span> {car.fuel.charAt(0).toUpperCase() + car.fuel.slice(1)}
            </div>
            <div>
              <span className="font-medium">Boîte :</span> {car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1)}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {car.location.city} ({car.location.department})
            </div>
            <div>
              {formatDate(car.createdAt)}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
} 
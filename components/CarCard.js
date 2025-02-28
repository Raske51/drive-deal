import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, MapPin, Gauge, Fuel, Settings, Shield, Tag } from 'lucide-react';

export default function CarCard({ car }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Formater le prix avec des espaces pour les milliers
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Formater le kilométrage avec des espaces pour les milliers
  const formatMileage = (mileage) => {
    return mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Fallback image en cas d'erreur
  const fallbackImage = "/images/car-placeholder.jpg";

  return (
    <Link href={`/car/${car.id}`}>
      <div className="group relative h-full overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl dark:bg-gray-800 hover:translate-y-[-8px] hover:scale-[1.02]">
        {/* Badge de statut (si présent) */}
        {car.isFeatured && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm shadow-md">
            <span className="flex items-center">
              <Star className="mr-1 h-3 w-3 fill-white" />
              Premium
            </span>
          </div>
        )}
        
        {/* Badge de vérification (si présent) */}
        {car.isVerified && (
          <div className="absolute right-3 top-3 z-10 rounded-full bg-green-500/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm flex items-center shadow-md">
            <Shield className="mr-1 h-3 w-3" />
            Vérifié
          </div>
        )}
        
        {/* Image du véhicule */}
        <div className="relative h-52 w-full overflow-hidden">
          <Image
            src={imageError ? fallbackImage : car.imageUrl}
            alt={`${car.make} ${car.model}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 transition-opacity group-hover:opacity-70"></div>
          
          {/* Bouton favori */}
          <button
            onClick={toggleFavorite}
            className={`absolute right-3 bottom-3 rounded-full p-2 transition-all ${
              isFavorite 
                ? 'bg-primary text-white' 
                : 'bg-white/80 text-gray-700 hover:bg-white'
            } shadow-md hover:scale-110`}
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>
        
        {/* Contenu de la carte */}
        <div className="p-5">
          {/* Titre et prix */}
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {car.make} {car.model}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{car.year}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">
                {formatPrice(car.price)} €
              </p>
              {car.discount && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center justify-end">
                  <Tag className="mr-1 h-3 w-3" />
                  Économisez {car.discount}%
                </p>
              )}
            </div>
          </div>
          
          {/* Caractéristiques */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div className="flex items-center rounded-md bg-gray-50 p-2 dark:bg-gray-700">
              <Gauge className="mr-2 h-4 w-4 text-primary" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {formatMileage(car.mileage)} km
              </span>
            </div>
            <div className="flex items-center rounded-md bg-gray-50 p-2 dark:bg-gray-700">
              <Fuel className="mr-2 h-4 w-4 text-primary" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {car.fuelType}
              </span>
            </div>
            <div className="flex items-center rounded-md bg-gray-50 p-2 dark:bg-gray-700">
              <Settings className="mr-2 h-4 w-4 text-primary" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {car.transmission}
              </span>
            </div>
            <div className="flex items-center rounded-md bg-gray-50 p-2 dark:bg-gray-700">
              <MapPin className="mr-2 h-4 w-4 text-primary" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {car.location}
              </span>
            </div>
          </div>
          
          {/* Pied de carte */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
            <div className="flex items-center">
              <Star className="mr-1 h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {car.rating} ({car.reviewCount} avis)
              </span>
            </div>
            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 transition-colors">
              Voir détails
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
} 
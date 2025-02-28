import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';

/**
 * Composant CarCard optimisé avec lazy loading des images
 * 
 * Ce composant affiche une carte de voiture avec une image optimisée.
 * - L'image utilise loading="lazy" pour le chargement différé
 * - Les dimensions sont spécifiées pour éviter le CLS (Cumulative Layout Shift)
 * - L'attribut priority est défini à false car ce n'est pas une image critique
 */
const OptimizedCarCard = ({ car, onFavoriteToggle, isFavorite = false }) => {
  const {
    id,
    make,
    model,
    year,
    price,
    mileage,
    fuel_type,
    transmission,
    image_url
  } = car;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={image_url || 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80'}
          alt={`${make} ${model}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy" // Activation du lazy loading
          priority={false} // Ce n'est pas une image critique
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Optimisation des tailles pour différents écrans
        />
        <button
          onClick={() => onFavoriteToggle && onFavoriteToggle(id)}
          className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart
            size={20}
            className={`${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 dark:text-gray-300'}`}
          />
        </button>
      </div>
      
      <div className="p-4">
        <Link href={`/car/${id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{make} {model}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{year} • {mileage.toLocaleString()} km</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-600 dark:text-gray-300">{fuel_type}</span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-600 dark:text-gray-300">{transmission}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{price.toLocaleString()} €</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Voir détails →</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default OptimizedCarCard; 
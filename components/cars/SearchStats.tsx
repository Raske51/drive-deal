import { Car } from '../../models/Car';

interface SearchStatsProps {
  cars: Car[];
  total: number;
  filters: {
    [key: string]: any;
  };
}

export default function SearchStats({ cars, total, filters }: SearchStatsProps) {
  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([_, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== undefined && v !== '');
      }
      return value !== undefined && value !== '';
    }).length;
  };

  const calculateAveragePrice = () => {
    if (cars.length === 0) return 0;
    const sum = cars.reduce((acc, car) => acc + car.price, 0);
    return Math.round(sum / cars.length);
  };

  const calculatePriceRange = () => {
    if (cars.length === 0) return { min: 0, max: 0 };
    const prices = cars.map(car => car.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  };

  const calculateYearRange = () => {
    if (cars.length === 0) return { min: 0, max: 0 };
    const years = cars.map(car => car.year);
    return {
      min: Math.min(...years),
      max: Math.max(...years)
    };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const priceRange = calculatePriceRange();
  const yearRange = calculateYearRange();
  const averagePrice = calculateAveragePrice();
  const activeFilters = getActiveFiltersCount();

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Statistiques de recherche
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <p className="text-sm text-gray-500">Résultats</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {total}
          </p>
          <p className="text-sm text-gray-500">
            {activeFilters} filtre{activeFilters !== 1 ? 's' : ''} actif{activeFilters !== 1 ? 's' : ''}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Prix moyen</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {formatPrice(averagePrice)}
          </p>
          <p className="text-sm text-gray-500">
            sur {cars.length} résultat{cars.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Fourchette de prix</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {formatPrice(priceRange.min)}
          </p>
          <p className="text-sm text-gray-500">
            à {formatPrice(priceRange.max)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Années</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {yearRange.min}
          </p>
          <p className="text-sm text-gray-500">
            à {yearRange.max}
          </p>
        </div>
      </div>
    </div>
  );
} 
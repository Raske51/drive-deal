import { useState } from 'react';
import { Car } from '../../models/Car';
import CarCard from './CarCard';
import SortOptions from './SortOptions';
import SearchStats from './SearchStats';
import EmptyState from './EmptyState';
import Pagination from '../common/Pagination';

interface SearchResultsProps {
  cars: Car[];
  total: number;
  filters: any;
  loading?: boolean;
  onSortChange: (sort: string, order: 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
  currentSort: string;
  currentOrder: 'asc' | 'desc';
  onFavoriteToggle: (carId: string) => void;
  favorites: string[];
}

export default function SearchResults({
  cars,
  total,
  filters,
  loading = false,
  onSortChange,
  onPageChange,
  currentPage,
  totalPages,
  currentSort,
  currentOrder,
  onFavoriteToggle,
  favorites
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <EmptyState
        message="Aucun résultat trouvé"
        suggestion="Essayez de modifier vos critères de recherche"
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <SearchStats
          cars={cars}
          total={total}
          filters={filters}
        />
      </div>

      <div className="mb-6">
        <SortOptions
          currentSort={currentSort}
          currentOrder={currentOrder}
          onSortChange={onSortChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cars.map((car) => (
          <CarCard
            key={car._id}
            car={car}
            isFavorite={favorites.includes(car._id!)}
            onFavoriteToggle={() => onFavoriteToggle(car._id!)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
} 
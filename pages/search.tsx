import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import SearchFilters from '../components/cars/SearchFilters';
import SearchResults from '../components/cars/SearchResults';
import { Car } from '../models/Car';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSort, setCurrentSort] = useState('createdAt');
  const [currentOrder, setCurrentOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({});
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const params = router.query;
    if (Object.keys(params).length > 0) {
      const { page, sort, order, ...filterParams } = params;
      setCurrentPage(Number(page) || 1);
      setCurrentSort(sort as string || 'createdAt');
      setCurrentOrder((order as 'asc' | 'desc') || 'desc');
      setFilters(filterParams);
    }
    searchCars();
  }, [router.query]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get('/api/favorites');
      setFavorites(response.data.favorites.map((fav: Car) => fav._id!));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const searchCars = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        sort: currentSort,
        order: currentOrder,
        ...filters
      });

      const response = await axios.get(`/api/cars?${queryParams.toString()}`);
      setCars(response.data.cars);
      setTotal(response.data.total);
      setTotalPages(Math.ceil(response.data.total / 12)); // 12 items per page

      // Update URL with search parameters
      router.push({
        pathname: '/search',
        query: queryParams.toString()
      }, undefined, { shallow: true });
    } catch (error) {
      toast.error('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
    searchCars();
  };

  const handleSortChange = (sort: string, order: 'asc' | 'desc') => {
    setCurrentSort(sort);
    setCurrentOrder(order);
    searchCars();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    searchCars();
  };

  const handleFavoriteToggle = async (carId: string) => {
    await fetchFavorites();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Rechercher une voiture
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <SearchFilters
              onFiltersChange={handleFiltersChange}
              initialFilters={filters}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <SearchResults
              cars={cars}
              total={total}
              filters={filters}
              loading={loading}
              onSortChange={handleSortChange}
              onPageChange={handlePageChange}
              currentPage={currentPage}
              totalPages={totalPages}
              currentSort={currentSort}
              currentOrder={currentOrder}
              onFavoriteToggle={handleFavoriteToggle}
              favorites={favorites}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
} 
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Filter, ChevronDown, ChevronUp, Grid, List, SlidersHorizontal, ArrowUpDown, MapPin, AlertCircle, Check, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import Image from 'next/image';
import Link from 'next/link';
import { Gauge, Fuel, Settings, Star } from 'lucide-react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import CarCard from '../components/CarCard';
import Button from '../components/UI/Button';

// Données de démonstration pour les véhicules
const carsData = [
  {
    id: '1',
    make: 'BMW',
    model: 'X5',
    year: 2023,
    price: 89900,
    mileage: 5000,
    fuelType: 'Hybride',
    transmission: 'Automatique',
    location: 'Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    rating: 4.8,
    reviewCount: 24,
    isFeatured: true,
    isVerified: true,
  },
  {
    id: '2',
    make: 'Mercedes',
    model: 'Classe E',
    year: 2022,
    price: 75500,
    mileage: 15000,
    fuelType: 'Diesel',
    transmission: 'Automatique',
    location: 'Lyon, France',
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    rating: 4.6,
    reviewCount: 18,
    isFeatured: true,
    isVerified: true,
  },
  {
    id: '3',
    make: 'Audi',
    model: 'Q7',
    year: 2023,
    price: 92000,
    mileage: 3000,
    fuelType: 'Essence',
    transmission: 'Automatique',
    location: 'Marseille, France',
    imageUrl: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2074&q=80',
    rating: 4.9,
    reviewCount: 15,
    isFeatured: true,
    isVerified: true,
  },
  {
    id: '4',
    make: 'Tesla',
    model: 'Model 3',
    year: 2023,
    price: 59900,
    mileage: 1000,
    fuelType: 'Électrique',
    transmission: 'Automatique',
    location: 'Bordeaux, France',
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80',
    rating: 4.7,
    reviewCount: 32,
    isFeatured: true,
    isVerified: true,
  },
  {
    id: '5',
    make: 'Volkswagen',
    model: 'Golf',
    year: 2021,
    price: 28500,
    mileage: 25000,
    fuelType: 'Essence',
    transmission: 'Manuelle',
    location: 'Lille, France',
    imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    rating: 4.5,
    reviewCount: 42,
    isFeatured: false,
    isVerified: true,
  },
  {
    id: '6',
    make: 'Toyota',
    model: 'RAV4',
    year: 2022,
    price: 39800,
    mileage: 18000,
    fuelType: 'Hybride',
    transmission: 'Automatique',
    location: 'Toulouse, France',
    imageUrl: 'https://images.unsplash.com/photo-1581540222194-0def2d8ff658?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2067&q=80',
    rating: 4.4,
    reviewCount: 28,
    isFeatured: false,
    isVerified: false,
  },
  {
    id: '7',
    make: 'Porsche',
    model: '911',
    year: 2023,
    price: 149900,
    mileage: 1500,
    fuelType: 'Essence',
    transmission: 'Automatique',
    location: 'Nice, France',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    rating: 4.9,
    reviewCount: 12,
    isFeatured: true,
    isVerified: true,
  },
  {
    id: '8',
    make: 'Audi',
    model: 'A3',
    year: 2021,
    price: 32500,
    mileage: 22000,
    fuelType: 'Diesel',
    transmission: 'Automatique',
    location: 'Strasbourg, France',
    imageUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80',
    rating: 4.3,
    reviewCount: 35,
    isFeatured: false,
    isVerified: false,
  },
];

const sortOptions = [
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'year_desc', label: 'Année récente' },
  { value: 'year_asc', label: 'Année ancienne' },
  { value: 'mileage_asc', label: 'Kilométrage bas' },
  { value: 'mileage_desc', label: 'Kilométrage élevé' },
  { value: 'rating_desc', label: 'Meilleures notes' },
];

export default function Listings() {
  const router = useRouter();
  const { darkMode } = useTheme();
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('price_asc');
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);

  // Récupérer les filtres de l'URL
  useEffect(() => {
    if (!router.isReady) return;

    setIsLoading(true);
    setIsAnimating(true);
    
    // Simuler un chargement des données
    setTimeout(() => {
      // Filtrer les voitures en fonction des paramètres d'URL
      let results = [...carsData];
      const filters = {};
      
      const { 
        make, model, minPrice, maxPrice, minYear, maxYear, 
        fuelType, transmission, location, featured, verified
      } = router.query;
      
      if (make) {
        results = results.filter(car => car.make.toLowerCase() === make.toLowerCase());
        filters.make = make;
      }
      
      if (model) {
        results = results.filter(car => car.model.toLowerCase().includes(model.toLowerCase()));
        filters.model = model;
      }
      
      if (minPrice) {
        results = results.filter(car => car.price >= parseInt(minPrice));
        filters.minPrice = minPrice;
      }
      
      if (maxPrice) {
        results = results.filter(car => car.price <= parseInt(maxPrice));
        filters.maxPrice = maxPrice;
      }
      
      if (minYear) {
        results = results.filter(car => car.year >= parseInt(minYear));
        filters.minYear = minYear;
      }
      
      if (maxYear) {
        results = results.filter(car => car.year <= parseInt(maxYear));
        filters.maxYear = maxYear;
      }
      
      if (fuelType) {
        results = results.filter(car => car.fuelType.toLowerCase() === fuelType.toLowerCase());
        filters.fuelType = fuelType;
      }
      
      if (transmission) {
        results = results.filter(car => car.transmission.toLowerCase() === transmission.toLowerCase());
        filters.transmission = transmission;
      }
      
      if (location) {
        results = results.filter(car => car.location.toLowerCase().includes(location.toLowerCase()));
        filters.location = location;
      }
      
      if (featured === 'true') {
        results = results.filter(car => car.isFeatured);
        filters.featured = true;
      }
      
      if (verified === 'true') {
        results = results.filter(car => car.isVerified);
        filters.verified = true;
      }
      
      setCars(carsData);
      setFilteredCars(results);
      setActiveFilters(filters);
      setIsLoading(false);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }, 800);
  }, [router.isReady, router.query]);

  // Appliquer le tri
  useEffect(() => {
    if (filteredCars.length === 0) return;
    
    setIsAnimating(true);
    
    const sortedCars = [...filteredCars].sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'year_desc':
          return b.year - a.year;
        case 'year_asc':
          return a.year - b.year;
        case 'mileage_asc':
          return a.mileage - b.mileage;
        case 'mileage_desc':
          return b.mileage - a.mileage;
        case 'rating_desc':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
    
    // Ajouter un délai pour l'animation
    setTimeout(() => {
      setFilteredCars(sortedCars);
      setIsAnimating(false);
      setAnimateCards(true);
      
      // Réinitialiser l'animation après un court délai
      setTimeout(() => {
        setAnimateCards(false);
      }, 800);
    }, 300);
  }, [sortBy]);

  // Détecter le défilement pour afficher le bouton de retour en haut
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const removeFilter = (key) => {
    const newQuery = { ...router.query };
    delete newQuery[key];
    router.push({
      pathname: '/listings',
      query: newQuery,
    });
  };

  const clearAllFilters = () => {
    router.push('/listings');
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Formater les valeurs des filtres pour l'affichage
  const formatFilterValue = (key, value) => {
    switch (key) {
      case 'minPrice':
        return `Min: ${value} €`;
      case 'maxPrice':
        return `Max: ${value} €`;
      case 'minYear':
        return `Depuis ${value}`;
      case 'maxYear':
        return `Jusqu'à ${value}`;
      case 'featured':
        return 'En vedette';
      case 'verified':
        return 'Vérifié';
      default:
        return value;
    }
  };

  return (
    <>
      <Head>
        <title>Véhicules disponibles | DriveDeal</title>
        <meta name="description" content="Découvrez notre sélection de véhicules d'occasion et neufs. Trouvez la voiture de vos rêves parmi notre large gamme de marques et modèles." />
      </Head>

      <div className={darkMode ? 'dark' : ''}>
        <Header />

        <main className="min-h-screen bg-gray-50 pb-16 pt-24 dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 listings-main-container">
            {/* Barre de recherche */}
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800 animate-fadeIn">
              <SearchBar variant="compact" />
            </div>

            {/* Titre et compteur de résultats */}
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center animate-fadeIn page-layout no-bottom-space">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Véhicules disponibles</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {filteredCars.length} {filteredCars.length > 1 ? 'véhicules trouvés' : 'véhicule trouvé'}
                </p>
              </div>

              {/* Actions de filtrage et tri - Desktop */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="appearance-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 transition-all duration-200"
                  >
                    <option value="" disabled>Trier par</option>
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-300">
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex items-center rounded-xl border border-gray-300 dark:border-gray-600 overflow-hidden">
                  <button
                    onClick={() => handleViewModeChange('grid')}
                    className={`flex items-center justify-center p-2.5 transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                    aria-label="Vue en grille"
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleViewModeChange('list')}
                    className={`flex items-center justify-center p-2.5 transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                    aria-label="Vue en liste"
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>

                <Button
                  onClick={toggleFilter}
                  variant="outline"
                  size="sm"
                  icon={<Filter className="h-4 w-4" />}
                  iconPosition="left"
                  className="border-gray-300 dark:border-gray-600 hover:border-primary transition-all duration-200"
                >
                  Filtres
                  {Object.keys(activeFilters).length > 0 && (
                    <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                      {Object.keys(activeFilters).length}
                    </span>
                  )}
                </Button>
              </div>

              {/* Actions de filtrage et tri - Mobile */}
              <div className="flex md:hidden items-center justify-between w-full">
                <Button
                  onClick={() => setShowFiltersMobile(true)}
                  variant="outline"
                  size="sm"
                  icon={<Filter className="h-4 w-4" />}
                  iconPosition="left"
                  className="border-gray-300 dark:border-gray-600 flex-1 mr-2 hover:border-primary transition-all duration-200"
                >
                  Filtres
                  {Object.keys(activeFilters).length > 0 && (
                    <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                      {Object.keys(activeFilters).length}
                    </span>
                  )}
                </Button>

                <div className="relative flex-1">
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 transition-all duration-200"
                  >
                    <option value="" disabled>Trier par</option>
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-300">
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Filtres actifs */}
            {Object.keys(activeFilters).length > 0 && (
              <div className="mb-6 animate-fadeIn">
                <div className="flex flex-wrap items-center gap-2">
                  {Object.entries(activeFilters).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-sm text-primary"
                    >
                      <span>{formatFilterValue(key, value)}</span>
                      <button
                        onClick={() => removeFilter(key)}
                        className="ml-2 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={clearAllFilters}
                    className="ml-2 text-sm text-primary hover:underline"
                  >
                    Effacer tout
                  </button>
                </div>
              </div>
            )}
            
            {/* Contenu principal */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              {/* Filtres - Desktop */}
              <div className={`hidden lg:block transition-all duration-300 ${isFilterOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
                <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800 animate-fadeIn">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Filtres</h2>
                    {Object.keys(activeFilters).length > 0 && (
                      <button
                        onClick={() => {
                          router.push('/listings', undefined, { shallow: true });
                        }}
                        className="text-sm text-primary hover:underline transition-colors"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>

                  {/* Filtres par marque */}
                  <div className="mb-6 border-b border-gray-200 pb-6 dark:border-gray-700">
                    <h3 className="mb-4 font-medium text-gray-900 dark:text-white">Marque</h3>
                    <div className="space-y-3">
                      {['BMW', 'Mercedes', 'Audi', 'Tesla', 'Volkswagen', 'Toyota', 'Porsche'].map((brand) => (
                        <div key={brand} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`brand-${brand}`}
                            checked={activeFilters.make === brand}
                            onChange={() => {
                              const newQuery = { ...router.query };
                              if (activeFilters.make === brand) {
                                delete newQuery.make;
                              } else {
                                newQuery.make = brand;
                              }
                              router.push({ pathname: '/listings', query: newQuery }, undefined, { shallow: true });
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                          />
                          <label
                            htmlFor={`brand-${brand}`}
                            className="ml-2.5 text-gray-700 dark:text-gray-300 cursor-pointer hover:text-primary transition-colors"
                          >
                            {brand}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filtres par prix */}
                  <div className="mb-6 border-b border-gray-200 pb-6 dark:border-gray-700">
                    <h3 className="mb-4 font-medium text-gray-900 dark:text-white">Prix</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="minPrice" className="mb-1.5 block text-sm text-gray-600 dark:text-gray-400">
                          Min
                        </label>
                        <input
                          type="number"
                          id="minPrice"
                          placeholder="Min €"
                          value={activeFilters.minPrice || ''}
                          onChange={(e) => {
                            const newQuery = { ...router.query };
                            if (e.target.value) {
                              newQuery.minPrice = e.target.value;
                            } else {
                              delete newQuery.minPrice;
                            }
                            router.push({ pathname: '/listings', query: newQuery }, undefined, { shallow: true });
                          }}
                          className="w-full rounded-xl border border-gray-300 p-2.5 text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label htmlFor="maxPrice" className="mb-1.5 block text-sm text-gray-600 dark:text-gray-400">
                          Max
                        </label>
                        <input
                          type="number"
                          id="maxPrice"
                          placeholder="Max €"
                          value={activeFilters.maxPrice || ''}
                          onChange={(e) => {
                            const newQuery = { ...router.query };
                            if (e.target.value) {
                              newQuery.maxPrice = e.target.value;
                            } else {
                              delete newQuery.maxPrice;
                            }
                            router.push({ pathname: '/listings', query: newQuery }, undefined, { shallow: true });
                          }}
                          className="w-full rounded-xl border border-gray-300 p-2.5 text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filtres par type de carburant */}
                  <div className="mb-6 border-b border-gray-200 pb-6 dark:border-gray-700">
                    <h3 className="mb-4 font-medium text-gray-900 dark:text-white">Carburant</h3>
                    <div className="space-y-3">
                      {['Essence', 'Diesel', 'Hybride', 'Électrique'].map((fuel) => (
                        <div key={fuel} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`fuel-${fuel}`}
                            checked={activeFilters.fuelType === fuel}
                            onChange={() => {
                              const newQuery = { ...router.query };
                              if (activeFilters.fuelType === fuel) {
                                delete newQuery.fuelType;
                              } else {
                                newQuery.fuelType = fuel;
                              }
                              router.push({ pathname: '/listings', query: newQuery }, undefined, { shallow: true });
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                          />
                          <label
                            htmlFor={`fuel-${fuel}`}
                            className="ml-2.5 text-gray-700 dark:text-gray-300 cursor-pointer hover:text-primary transition-colors"
                          >
                            {fuel}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filtres par transmission */}
                  <div className="mb-6 border-b border-gray-200 pb-6 dark:border-gray-700">
                    <h3 className="mb-4 font-medium text-gray-900 dark:text-white">Transmission</h3>
                    <div className="space-y-3">
                      {['Automatique', 'Manuelle'].map((transmission) => (
                        <div key={transmission} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`transmission-${transmission}`}
                            checked={activeFilters.transmission === transmission}
                            onChange={() => {
                              const newQuery = { ...router.query };
                              if (activeFilters.transmission === transmission) {
                                delete newQuery.transmission;
                              } else {
                                newQuery.transmission = transmission;
                              }
                              router.push({ pathname: '/listings', query: newQuery }, undefined, { shallow: true });
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                          />
                          <label
                            htmlFor={`transmission-${transmission}`}
                            className="ml-2.5 text-gray-700 dark:text-gray-300 cursor-pointer hover:text-primary transition-colors"
                          >
                            {transmission}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Autres filtres */}
                  <div>
                    <h3 className="mb-4 font-medium text-gray-900 dark:text-white">Autres filtres</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={activeFilters.featured}
                          onChange={() => {
                            const newQuery = { ...router.query };
                            if (activeFilters.featured) {
                              delete newQuery.featured;
                            } else {
                              newQuery.featured = 'true';
                            }
                            router.push({ pathname: '/listings', query: newQuery }, undefined, { shallow: true });
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                        />
                        <label
                          htmlFor="featured"
                          className="ml-2.5 text-gray-700 dark:text-gray-300 cursor-pointer hover:text-primary transition-colors"
                        >
                          Véhicules premium
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="verified"
                          checked={activeFilters.verified}
                          onChange={() => {
                            const newQuery = { ...router.query };
                            if (activeFilters.verified) {
                              delete newQuery.verified;
                            } else {
                              newQuery.verified = 'true';
                            }
                            router.push({ pathname: '/listings', query: newQuery }, undefined, { shallow: true });
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                        />
                        <label
                          htmlFor="verified"
                          className="ml-2.5 text-gray-700 dark:text-gray-300 cursor-pointer hover:text-primary transition-colors"
                        >
                          Véhicules vérifiés
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des véhicules */}
              <div className={`${isFilterOpen ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
                {isLoading ? (
                  <div className="flex h-96 items-center justify-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="ml-4 text-lg font-medium text-gray-600 dark:text-gray-300 animate-pulse">Chargement des véhicules...</p>
                  </div>
                ) : filteredCars.length === 0 ? (
                  <div className="flex h-96 flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-gray-800 animate-fadeIn">
                    <AlertCircle className="mb-4 h-16 w-16 text-gray-400" />
                    <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Aucun véhicule trouvé</h2>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                      Aucun véhicule ne correspond à vos critères de recherche. Essayez d'ajuster vos filtres.
                    </p>
                    <Button
                      onClick={() => {
                        router.push('/listings', undefined, { shallow: true });
                      }}
                      variant="primary"
                      size="lg"
                      is3D={true}
                      className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                    >
                      Réinitialiser les filtres
                    </Button>
                  </div>
                ) : (
                  <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {filteredCars.map((car, index) => (
                          <div 
                            key={car.id} 
                            className={`animate-fadeIn ${animateCards ? 'animate-bounce-in' : ''}`} 
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <CarCard car={car} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {filteredCars.map((car, index) => (
                          <div 
                            key={car.id} 
                            className={`animate-fadeIn ${animateCards ? 'animate-slide-in-right' : ''}`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <Link href={`/car/${car.id}`}>
                              <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl dark:bg-gray-800 sm:flex-row hover:translate-y-[-4px]">
                                <div className="relative h-56 w-full sm:h-auto sm:w-1/3">
                                  <Image
                                    src={car.imageUrl}
                                    alt={`${car.make} ${car.model}`}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    loading="lazy"
                                    quality={85}
                                  />
                                  {car.isFeatured && (
                                    <div className="absolute left-3 top-3 z-10 rounded-full bg-gradient-to-r from-primary to-secondary px-3 py-1.5 text-xs font-semibold text-white shadow-md">
                                      <span className="flex items-center">
                                        <Star className="mr-1 h-3 w-3 fill-white" />
                                        Premium
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* Overlay gradient */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-60"></div>
                                </div>
                                <div className="flex flex-1 flex-col p-5 space-y-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-300">
                                        {car.make} {car.model}
                                      </h3>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{car.year}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-bold text-primary">
                                        {car.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} €
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40 p-2.5 rounded-xl">
                                      <Gauge className="mr-2 h-4 w-4 text-primary" />
                                      {car.mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} km
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40 p-2.5 rounded-xl">
                                      <Fuel className="mr-2 h-4 w-4 text-primary" />
                                      {car.fuelType}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40 p-2.5 rounded-xl">
                                      <Settings className="mr-2 h-4 w-4 text-primary" />
                                      {car.transmission}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40 p-2.5 rounded-xl">
                                      <MapPin className="mr-2 h-4 w-4 text-primary" />
                                      {car.location}
                                    </div>
                                  </div>
                                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
                                    {car.rating && (
                                      <div className="flex items-center">
                                        <Star className="mr-1.5 h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-medium">{car.rating}</span>
                                        {car.reviewCount && (
                                          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                            ({car.reviewCount} avis)
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    <div className="rounded-full bg-primary/10 px-4 py-2 text-xs font-medium text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 transform-gpu">
                                      Voir détails
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Filtres mobiles */}
        {showFiltersMobile && (
          <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900 animate-slideInBottom md:hidden">
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Filtres</h2>
              <button
                onClick={() => setShowFiltersMobile(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {/* Contenu des filtres mobiles - similaire aux filtres desktop */}
              {/* Filtres par marque */}
              <div className="mb-6 border-b border-gray-200 pb-6 dark:border-gray-700">
                <h3 className="mb-4 font-medium text-gray-900 dark:text-white">Marque</h3>
                <div className="space-y-3">
                  {['BMW', 'Mercedes', 'Audi', 'Tesla', 'Volkswagen', 'Toyota', 'Porsche'].map((brand) => (
                    <div key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`mobile-brand-${brand}`}
                        checked={activeFilters.make === brand}
                        onChange={() => {
                          const newQuery = { ...router.query };
                          if (activeFilters.make === brand) {
                            delete newQuery.make;
                          } else {
                            newQuery.make = brand;
                          }
                          router.push({ pathname: '/listings', query: newQuery }, undefined, { shallow: true });
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                      />
                      <label
                        htmlFor={`mobile-brand-${brand}`}
                        className="ml-2.5 text-gray-700 dark:text-gray-300 cursor-pointer"
                      >
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Autres filtres mobiles... */}
            </div>
            <div className="border-t border-gray-200 p-4 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => {
                    router.push('/listings', undefined, { shallow: true });
                    setShowFiltersMobile(false);
                  }}
                  variant="outline"
                  fullWidth
                >
                  Réinitialiser
                </Button>
                <Button
                  onClick={() => setShowFiltersMobile(false)}
                  variant="primary"
                  fullWidth
                  is3D={true}
                >
                  Appliquer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bouton de retour en haut */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 rounded-full bg-primary p-3 text-white shadow-lg transition-all duration-300 hover:bg-primary-dark hover:scale-110 ${
            showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
          aria-label="Retour en haut"
        >
          <ChevronUp className="h-6 w-6" />
        </button>

        <Footer />
      </div>
    </>
  );
} 
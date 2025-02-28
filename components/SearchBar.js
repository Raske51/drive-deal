import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, ChevronDown, Sliders, X, Calendar, Euro, Car, Filter, MapPin, RefreshCw, Settings } from 'lucide-react';
import Button from './UI/Button';

export default function SearchBar({ className = '', variant = 'default' }) {
  const router = useRouter();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    make: '',
    model: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    fuelType: '',
    transmission: '',
    location: '',
  });
  const [isAnimating, setIsAnimating] = useState(false);

  // Récupérer les paramètres de l'URL lors du chargement
  useEffect(() => {
    if (Object.keys(router.query).length > 0) {
      const newParams = { ...searchParams };
      
      Object.entries(router.query).forEach(([key, value]) => {
        if (key in newParams) {
          newParams[key] = value;
        }
      });
      
      setSearchParams(newParams);
      
      // Si des filtres avancés sont définis, ouvrir automatiquement la section
      if (
        newParams.minYear || 
        newParams.maxYear || 
        newParams.fuelType || 
        newParams.transmission
      ) {
        setIsAdvancedOpen(true);
      }
    }
  }, [router.query]);

  const carMakes = [
    { value: '', label: 'Toutes les marques' },
    { value: 'audi', label: 'Audi' },
    { value: 'bmw', label: 'BMW' },
    { value: 'mercedes', label: 'Mercedes' },
    { value: 'tesla', label: 'Tesla' },
    { value: 'porsche', label: 'Porsche' },
    { value: 'ferrari', label: 'Ferrari' },
    { value: 'lamborghini', label: 'Lamborghini' },
    { value: 'volkswagen', label: 'Volkswagen' },
    { value: 'toyota', label: 'Toyota' },
    { value: 'renault', label: 'Renault' },
    { value: 'peugeot', label: 'Peugeot' },
  ];

  const fuelTypes = [
    { value: '', label: 'Tous les carburants' },
    { value: 'essence', label: 'Essence' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'hybride', label: 'Hybride' },
    { value: 'electrique', label: 'Électrique' },
    { value: 'gpl', label: 'GPL' },
  ];

  const transmissions = [
    { value: '', label: 'Toutes les transmissions' },
    { value: 'manuelle', label: 'Manuelle' },
    { value: 'automatique', label: 'Automatique' },
    { value: 'semi-auto', label: 'Semi-automatique' },
  ];
  
  const locations = [
    { value: '', label: 'Toute la France' },
    { value: 'paris', label: 'Paris' },
    { value: 'lyon', label: 'Lyon' },
    { value: 'marseille', label: 'Marseille' },
    { value: 'bordeaux', label: 'Bordeaux' },
    { value: 'lille', label: 'Lille' },
    { value: 'toulouse', label: 'Toulouse' },
    { value: 'nice', label: 'Nice' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value,
    });
  };

  const toggleAdvanced = () => {
    setIsAnimating(true);
    setIsAdvancedOpen(!isAdvancedOpen);
    
    // Réinitialiser l'état d'animation après la transition
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filtrer les paramètres vides
    const filteredParams = Object.fromEntries(
      Object.entries(searchParams).filter(([_, value]) => value !== '')
    );
    
    // Rediriger vers la page de résultats avec les paramètres
    router.push({
      pathname: '/listings',
      query: filteredParams,
    });
  };

  const handleReset = () => {
    setSearchParams({
      make: '',
      model: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      fuelType: '',
      transmission: '',
      location: '',
    });
  };

  // Définir les classes en fonction de la variante
  const containerClasses = variant === 'compact' 
    ? `bg-white dark:bg-gray-800 rounded-lg shadow-md px-6 py-4 ${className}`
    : `bg-white dark:bg-gray-800 rounded-lg shadow-md px-6 py-4 ${className}`;

  return (
    <div className={containerClasses}>
      <form onSubmit={handleSubmit}>
        {/* Recherche de base */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="make" className="block text-sm font-medium text-left text-gray-700 dark:text-gray-300">
              <Car className="inline-block mr-2 h-4 w-4 text-primary" />
              Marque
            </label>
            <div className="relative">
              <select
                id="make"
                value={searchParams.make}
                onChange={(e) => setSearchParams({ ...searchParams, make: e.target.value })}
                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Toutes les marques</option>
                <option value="audi">Audi</option>
                <option value="bmw">BMW</option>
                <option value="mercedes">Mercedes</option>
                <option value="tesla">Tesla</option>
                <option value="porsche">Porsche</option>
                <option value="ferrari">Ferrari</option>
                <option value="lamborghini">Lamborghini</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium text-left text-gray-700 dark:text-gray-300">
              <MapPin className="inline-block mr-2 h-4 w-4 text-primary" />
              Localisation
            </label>
            <div className="relative">
              <input
                type="text"
                id="location"
                value={searchParams.location}
                onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                placeholder="Ville ou code postal"
                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="block text-sm font-medium text-left text-gray-700 dark:text-gray-300">
              <Euro className="inline-block mr-2 h-4 w-4 text-primary" />
              Budget max
            </label>
            <div className="relative">
              <input
                type="number"
                id="price"
                value={searchParams.maxPrice}
                onChange={(e) => setSearchParams({ ...searchParams, maxPrice: e.target.value })}
                placeholder="Budget maximum"
                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Bouton pour afficher/masquer les filtres avancés */}
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={toggleAdvanced}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
          >
            <Sliders className="mr-2 h-4 w-4" />
            Filtres avancés
            <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className="flex space-x-2">
            <Button
              type="button"
              onClick={handleReset}
              variant="outline"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              iconPosition="left"
            >
              Réinitialiser
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={<Search className="h-4 w-4" />}
              iconPosition="left"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
            >
              Rechercher
            </Button>
          </div>
        </div>

        {/* Filtres avancés */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isAdvancedOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-left text-gray-700 dark:text-gray-300">
                <Calendar className="inline-block mr-2 h-4 w-4 text-primary" />
                Année
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    value={searchParams.minYear}
                    onChange={(e) => setSearchParams({ ...searchParams, minYear: e.target.value })}
                    placeholder="Min"
                    className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={searchParams.maxYear}
                    onChange={(e) => setSearchParams({ ...searchParams, maxYear: e.target.value })}
                    placeholder="Max"
                    className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-left text-gray-700 dark:text-gray-300">
                <Fuel className="inline-block mr-2 h-4 w-4 text-primary" />
                Carburant
              </label>
              <div className="relative">
                <select
                  value={searchParams.fuelType}
                  onChange={(e) => setSearchParams({ ...searchParams, fuelType: e.target.value })}
                  className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Tous les carburants</option>
                  <option value="essence">Essence</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybride">Hybride</option>
                  <option value="electrique">Électrique</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-left text-gray-700 dark:text-gray-300">
                <Settings className="inline-block mr-2 h-4 w-4 text-primary" />
                Transmission
              </label>
              <div className="relative">
                <select
                  value={searchParams.transmission}
                  onChange={(e) => setSearchParams({ ...searchParams, transmission: e.target.value })}
                  className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Toutes les transmissions</option>
                  <option value="manuelle">Manuelle</option>
                  <option value="automatique">Automatique</option>
                  <option value="semi-automatique">Semi-automatique</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// Composant Fuel (icône de carburant)
function Fuel(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="22" x2="15" y2="22"></line>
      <line x1="4" y1="9" x2="14" y2="9"></line>
      <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"></path>
      <path d="M14 12h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"></path>
    </svg>
  );
} 
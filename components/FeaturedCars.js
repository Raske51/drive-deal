import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import CarCard from './CarCard';

export default function FeaturedCars() {
  const [activeTab, setActiveTab] = useState('all');

  // Données simulées pour les véhicules en vedette
  const featuredCars = [
    {
      id: '1',
      make: 'BMW',
      model: 'X5',
      year: 2023,
      price: 89900,
      oldPrice: 92500,
      mileage: 5000,
      fuelType: 'Hybride',
      transmission: 'Automatique',
      location: 'Paris',
      imageUrl: 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?q=80&w=2000',
      rating: 4.9,
      reviewCount: 28,
      isFeatured: true,
      isVerified: true
    },
    {
      id: '2',
      make: 'Mercedes',
      model: 'Classe E',
      year: 2022,
      price: 76500,
      mileage: 12000,
      fuelType: 'Diesel',
      transmission: 'Automatique',
      location: 'Lyon',
      imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2000',
      rating: 4.7,
      reviewCount: 19,
      isFeatured: true,
      isVerified: true
    },
    {
      id: '3',
      make: 'Audi',
      model: 'Q7',
      year: 2023,
      price: 85000,
      mileage: 8000,
      fuelType: 'Essence',
      transmission: 'Automatique',
      location: 'Marseille',
      imageUrl: 'https://images.unsplash.com/photo-1606664922998-f8551ef1c7f7?q=80&w=2000',
      rating: 4.8,
      reviewCount: 22,
      isFeatured: true,
      isVerified: false
    },
    {
      id: '4',
      make: 'Tesla',
      model: 'Model 3',
      year: 2023,
      price: 52990,
      mileage: 1000,
      fuelType: 'Électrique',
      transmission: 'Automatique',
      location: 'Bordeaux',
      imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2000',
      rating: 5.0,
      reviewCount: 31,
      isFeatured: true,
      isVerified: true
    }
  ];

  // Filtrer les voitures en fonction de l'onglet actif
  const filteredCars = featuredCars.filter(car => {
    if (activeTab === 'all') return true;
    if (activeTab === 'electric') return car.fuelType === 'Électrique';
    if (activeTab === 'hybrid') return car.fuelType === 'Hybride';
    if (activeTab === 'luxury') return car.price > 75000;
    return true;
  });

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        {/* En-tête de section avec animation */}
        <div className="mb-10 text-center" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Véhicules Premium
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez notre sélection de véhicules haut de gamme, soigneusement inspectés et prêts à prendre la route.
          </p>
        </div>

        {/* Onglets de filtrage */}
        <div className="flex flex-wrap justify-center gap-2 mb-8" data-aos="fade-up" data-aos-delay="100">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === 'all'
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setActiveTab('electric')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === 'electric'
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Électriques
          </button>
          <button
            onClick={() => setActiveTab('hybrid')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === 'hybrid'
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Hybrides
          </button>
          <button
            onClick={() => setActiveTab('luxury')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === 'luxury'
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Luxe
          </button>
        </div>

        {/* Grille de véhicules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-aos="fade-up" data-aos-delay="200">
          {filteredCars.map((car) => (
            <div key={car.id} className="transform transition-all duration-300 hover:translate-y-[-5px]">
              <CarCard car={car} />
            </div>
          ))}
        </div>

        {/* Bouton "Voir plus" */}
        <div className="mt-12 text-center" data-aos="fade-up" data-aos-delay="300">
          <Link href="/vehicles" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-primary-dark group">
            Voir tous les véhicules
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
} 
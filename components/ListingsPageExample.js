import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Exemple de page de listings avec les corrections d'espacement
 * Ce composant montre comment structurer la page des listings pour éviter
 * les problèmes d'espace vide sous les filtres.
 */
const ListingsPageExample = () => {
  // État pour les filtres
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedMakes, setSelectedMakes] = useState([]);
  const [yearRange, setYearRange] = useState([2010, 2023]);
  
  // Données d'exemple pour les véhicules
  const vehicles = [
    { id: 1, make: 'Audi', model: 'A4', year: 2020, price: 35000, image: '/images/audi-a4.jpg' },
    { id: 2, make: 'BMW', model: 'X5', year: 2021, price: 65000, image: '/images/bmw-x5.jpg' },
    { id: 3, make: 'Mercedes', model: 'C-Class', year: 2019, price: 42000, image: '/images/mercedes-c.jpg' },
    { id: 4, make: 'Volkswagen', model: 'Golf', year: 2022, price: 28000, image: '/images/vw-golf.jpg' },
    { id: 5, make: 'Toyota', model: 'Corolla', year: 2021, price: 25000, image: '/images/toyota-corolla.jpg' },
    { id: 6, make: 'Honda', model: 'Civic', year: 2020, price: 23000, image: '/images/honda-civic.jpg' },
  ];
  
  // Liste des marques pour les filtres
  const makes = ['Audi', 'BMW', 'Mercedes', 'Volkswagen', 'Toyota', 'Honda', 'Renault', 'Peugeot'];
  
  // Gestion des filtres
  const toggleMake = (make) => {
    if (selectedMakes.includes(make)) {
      setSelectedMakes(selectedMakes.filter(m => m !== make));
    } else {
      setSelectedMakes([...selectedMakes, make]);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 listings-main-container">
      <h1 className="text-3xl font-bold mb-6">Nos véhicules disponibles</h1>
      
      {/* Utilisation de la classe page-layout pour la structure principale */}
      <div className="page-layout no-bottom-space">
        {/* Colonne des filtres */}
        <div className="filters-wrapper">
          <div className="filters-sticky bg-white dark:bg-gray-800 p-4 rounded-lg shadow no-bottom-space">
            <h2 className="text-xl font-semibold mb-4">Filtres</h2>
            
            <div className="filters-container">
              {/* Section de filtre - Prix */}
              <div className="filter-section">
                <h3 className="font-medium mb-2">Prix</h3>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span>{priceRange[0].toLocaleString()} €</span>
                    <span>{priceRange[1].toLocaleString()} €</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Section de filtre - Marque */}
              <div className="filter-section">
                <h3 className="font-medium mb-2">Marque</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {makes.map(make => (
                    <div key={make} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`make-${make}`}
                        checked={selectedMakes.includes(make)}
                        onChange={() => toggleMake(make)}
                        className="mr-2"
                      />
                      <label htmlFor={`make-${make}`}>{make}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Section de filtre - Année */}
              <div className="filter-section">
                <h3 className="font-medium mb-2">Année</h3>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span>{yearRange[0]}</span>
                    <span>{yearRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="2023"
                    value={yearRange[1]}
                    onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Bouton d'application des filtres */}
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                Appliquer les filtres
              </button>
            </div>
          </div>
        </div>
        
        {/* Liste des véhicules */}
        <div className="vehicles-list">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full">
                <Image
                  src={vehicle.image || "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80"}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{vehicle.make} {vehicle.model}</h3>
                <p className="text-gray-500 dark:text-gray-400">{vehicle.year}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{vehicle.price.toLocaleString()} €</span>
                  <Link href={`/vehicle/${vehicle.id}`} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                    Voir détails
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <nav className="inline-flex rounded-md shadow">
          <a href="#" className="px-3 py-2 rounded-l-md bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
            Précédent
          </a>
          <a href="#" className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700">
            1
          </a>
          <a href="#" className="px-3 py-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
            2
          </a>
          <a href="#" className="px-3 py-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
            3
          </a>
          <a href="#" className="px-3 py-2 rounded-r-md bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
            Suivant
          </a>
        </nav>
      </div>
    </div>
  );
};

export default ListingsPageExample; 
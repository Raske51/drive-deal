import React, { useState } from 'react';
import { ArrowRight, Check, X, ChevronDown, ChevronUp, Car } from 'lucide-react';
import Button from './UI/Button';

export default function CarComparison() {
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  
  // Données de comparaison
  const comparisonData = {
    car1: {
      make: 'BMW',
      model: 'X5',
      year: 2023,
      price: 89900,
      mileage: 5000,
      fuelType: 'Hybride',
      transmission: 'Automatique',
      power: '394 ch',
      acceleration: '5.6s (0-100 km/h)',
      consumption: '7.5L/100km',
      imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    },
    car2: {
      make: 'Mercedes',
      model: 'GLE',
      year: 2023,
      price: 92500,
      mileage: 3000,
      fuelType: 'Diesel',
      transmission: 'Automatique',
      power: '330 ch',
      acceleration: '6.1s (0-100 km/h)',
      consumption: '6.9L/100km',
      imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    }
  };

  // Formater le prix avec des espaces pour les milliers
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Déterminer quelle voiture est meilleure pour une propriété donnée
  const getBetterCar = (property) => {
    // Propriétés où une valeur plus basse est meilleure
    const lowerIsBetter = ['price', 'mileage', 'consumption', 'acceleration'];
    
    // Extraire les valeurs numériques pour la comparaison
    let value1, value2;
    
    if (property === 'acceleration') {
      // Extraire le nombre de secondes de l'accélération (ex: "5.6s (0-100 km/h)" -> 5.6)
      value1 = parseFloat(comparisonData.car1[property]);
      value2 = parseFloat(comparisonData.car2[property]);
    } else if (property === 'consumption') {
      // Extraire la consommation (ex: "7.5L/100km" -> 7.5)
      value1 = parseFloat(comparisonData.car1[property]);
      value2 = parseFloat(comparisonData.car2[property]);
    } else if (property === 'power') {
      // Extraire la puissance (ex: "394 ch" -> 394)
      value1 = parseInt(comparisonData.car1[property]);
      value2 = parseInt(comparisonData.car2[property]);
    } else {
      value1 = comparisonData.car1[property];
      value2 = comparisonData.car2[property];
    }
    
    if (lowerIsBetter.includes(property)) {
      if (value1 < value2) return 'car1';
      if (value2 < value1) return 'car2';
      return 'equal';
    } else {
      // Pour les autres propriétés, une valeur plus élevée est meilleure
      if (value1 > value2) return 'car1';
      if (value2 > value1) return 'car2';
      return 'equal';
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Comparez les véhicules
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Comparez les caractéristiques et spécifications des véhicules pour trouver celui qui correspond le mieux à vos besoins.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1">
          {/* En-têtes des voitures */}
          <div className="grid grid-cols-3 border-b border-gray-200 dark:border-gray-700">
            <div className="p-6 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Caractéristiques</h3>
            </div>
            
            <div className="p-6 border-l border-gray-200 dark:border-gray-700 text-center">
              <div className="relative h-40 mb-4 overflow-hidden rounded-lg">
                <img 
                  src={comparisonData.car1.imageUrl} 
                  alt={`${comparisonData.car1.make} ${comparisonData.car1.model}`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {comparisonData.car1.make} {comparisonData.car1.model}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{comparisonData.car1.year}</p>
            </div>
            
            <div className="p-6 border-l border-gray-200 dark:border-gray-700 text-center">
              <div className="relative h-40 mb-4 overflow-hidden rounded-lg">
                <img 
                  src={comparisonData.car2.imageUrl} 
                  alt={`${comparisonData.car2.make} ${comparisonData.car2.model}`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {comparisonData.car2.make} {comparisonData.car2.model}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{comparisonData.car2.year}</p>
            </div>
          </div>

          {/* Tableau de comparaison */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* Prix */}
            <div className="grid grid-cols-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
              <div className="p-4 flex items-center font-medium text-gray-700 dark:text-gray-300">
                Prix
              </div>
              <div className={`p-4 text-center ${getBetterCar('price') === 'car1' ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>
                {formatPrice(comparisonData.car1.price)} €
                {getBetterCar('price') === 'car1' && <Check className="inline-block ml-1 h-4 w-4" />}
              </div>
              <div className={`p-4 text-center ${getBetterCar('price') === 'car2' ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>
                {formatPrice(comparisonData.car2.price)} €
                {getBetterCar('price') === 'car2' && <Check className="inline-block ml-1 h-4 w-4" />}
              </div>
            </div>

            {/* Kilométrage */}
            <div className="grid grid-cols-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
              <div className="p-4 flex items-center font-medium text-gray-700 dark:text-gray-300">
                Kilométrage
              </div>
              <div className={`p-4 text-center ${getBetterCar('mileage') === 'car1' ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>
                {comparisonData.car1.mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} km
                {getBetterCar('mileage') === 'car1' && <Check className="inline-block ml-1 h-4 w-4" />}
              </div>
              <div className={`p-4 text-center ${getBetterCar('mileage') === 'car2' ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>
                {comparisonData.car2.mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} km
                {getBetterCar('mileage') === 'car2' && <Check className="inline-block ml-1 h-4 w-4" />}
              </div>
            </div>

            {/* Carburant */}
            <div className="grid grid-cols-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
              <div className="p-4 flex items-center font-medium text-gray-700 dark:text-gray-300">
                Carburant
              </div>
              <div className="p-4 text-center">
                {comparisonData.car1.fuelType}
              </div>
              <div className="p-4 text-center">
                {comparisonData.car2.fuelType}
              </div>
            </div>

            {/* Transmission */}
            <div className="grid grid-cols-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
              <div className="p-4 flex items-center font-medium text-gray-700 dark:text-gray-300">
                Transmission
              </div>
              <div className="p-4 text-center">
                {comparisonData.car1.transmission}
              </div>
              <div className="p-4 text-center">
                {comparisonData.car2.transmission}
              </div>
            </div>

            {/* Caractéristiques supplémentaires (masquées par défaut) */}
            <div className={`transition-all duration-500 overflow-hidden ${showAllFeatures ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {/* Puissance */}
              <div className="grid grid-cols-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <div className="p-4 flex items-center font-medium text-gray-700 dark:text-gray-300">
                  Puissance
                </div>
                <div className={`p-4 text-center ${getBetterCar('power') === 'car1' ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>
                  {comparisonData.car1.power}
                  {getBetterCar('power') === 'car1' && <Check className="inline-block ml-1 h-4 w-4" />}
                </div>
                <div className={`p-4 text-center ${getBetterCar('power') === 'car2' ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>
                  {comparisonData.car2.power}
                  {getBetterCar('power') === 'car2' && <Check className="inline-block ml-1 h-4 w-4" />}
                </div>
              </div>

              {/* Accélération */}
              <div className="grid grid-cols-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <div className="p-4 flex items-center font-medium text-gray-700 dark:text-gray-300">
                  Accélération
                </div>
                <div className={`p-4 text-center ${getBetterCar('acceleration') === 'car1' ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>
                  {comparisonData.car1.acceleration}
                  {getBetterCar('acceleration') === 'car1' && <Check className="inline-block ml-1 h-4 w-4" />}
                </div>
                <div className={`p-4 text-center ${getBetterCar('acceleration') === 'car2' ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>
                  {comparisonData.car2.acceleration}
                  {getBetterCar('acceleration') === 'car2' && <Check className="inline-block ml-1 h-4 w-4" />}
                </div>
              </div>

              {/* Consommation */}
              <div className="grid grid-cols-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <div className="p-4 flex items-center font-medium text-gray-700 dark:text-gray-300">
                  Consommation
                </div>
                <div className={`p-4 text-center ${getBetterCar('consumption') === 'car1' ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>
                  {comparisonData.car1.consumption}
                  {getBetterCar('consumption') === 'car1' && <Check className="inline-block ml-1 h-4 w-4" />}
                </div>
                <div className={`p-4 text-center ${getBetterCar('consumption') === 'car2' ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>
                  {comparisonData.car2.consumption}
                  {getBetterCar('consumption') === 'car2' && <Check className="inline-block ml-1 h-4 w-4" />}
                </div>
              </div>
            </div>
          </div>

          {/* Bouton pour afficher plus de caractéristiques */}
          <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
            >
              {showAllFeatures ? (
                <>
                  Voir moins
                  <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Voir plus de caractéristiques
                  <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="primary"
            size="lg"
            icon={<Car className="h-5 w-5" />}
            iconPosition="left"
            className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Comparer d'autres véhicules
          </Button>
        </div>
      </div>
    </section>
  );
} 
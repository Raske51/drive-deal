import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CenteredLayout, 
  CenteredText, 
  CenteredImage, 
  CenteredForm,
  CenteredButtons,
  CenteredSection,
  CenteredCards
} from './CenteredLayout';

/**
 * ExampleCenteredPage - Composant de démonstration montrant différentes techniques de centrage
 * Ce composant sert d'exemple pratique pour illustrer l'utilisation des classes et composants
 * de centrage dans un contexte réel.
 */
const ExampleCenteredPage = () => {
  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Recherche soumise');
  };

  // Données d'exemple pour les cartes
  const featuredCars = [
    { id: 1, make: 'Audi', model: 'A4', year: 2021, price: 39500, image: '/images/audi-a4.jpg' },
    { id: 2, make: 'BMW', model: 'X5', year: 2022, price: 62000, image: '/images/bmw-x5.jpg' },
    { id: 3, make: 'Mercedes', model: 'C-Class', year: 2020, price: 45000, image: '/images/mercedes-c.jpg' },
  ];

  return (
    <div className="example-page">
      {/* En-tête centré avec Flexbox */}
      <header className="flex-center py-4 bg-blue-600 text-white">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">DriveDeal</h1>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="hover:underline">Accueil</Link>
            <Link href="/listings" className="hover:underline">Véhicules</Link>
            <Link href="/about" className="hover:underline">À propos</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Hero section avec image centrée */}
      <CenteredSection className="bg-gray-100 py-16">
        <CenteredText>
          <h2 className="text-4xl font-bold mb-4">Trouvez votre véhicule idéal</h2>
          <p className="text-xl text-gray-600 mb-8">Des milliers de voitures sélectionnées avec soin pour une expérience d'achat exceptionnelle</p>
        </CenteredText>
        
        {/* Formulaire de recherche centré */}
        <CenteredForm onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
              <select className="w-full p-2 border rounded">
                <option>Toutes les marques</option>
                <option>Audi</option>
                <option>BMW</option>
                <option>Mercedes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix max</label>
              <select className="w-full p-2 border rounded">
                <option>Tous les prix</option>
                <option>20 000 €</option>
                <option>50 000 €</option>
                <option>100 000 €</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Année min</label>
              <select className="w-full p-2 border rounded">
                <option>Toutes les années</option>
                <option>2018</option>
                <option>2020</option>
                <option>2022</option>
              </select>
            </div>
          </div>
          <CenteredButtons>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors">
              Rechercher
            </button>
          </CenteredButtons>
        </CenteredForm>
      </CenteredSection>

      {/* Section de véhicules en vedette avec cartes centrées */}
      <section className="py-16">
        <CenteredText className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Véhicules en vedette</h2>
          <p className="text-gray-600">Découvrez nos meilleures offres du moment</p>
        </CenteredText>
        
        <CenteredCards className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          {featuredCars.map(car => (
            <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full">
                {/* Utilisation de l'image centrée */}
                <CenteredImage>
                  <Image
                    src={car.image || "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80"}
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </CenteredImage>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{car.make} {car.model}</h3>
                <p className="text-gray-500">{car.year}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xl font-bold text-blue-600">{car.price.toLocaleString()} €</span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                    Voir détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </CenteredCards>
      </section>

      {/* Section d'appel à l'action centrée avec Grid */}
      <section className="bg-blue-600 text-white py-16">
        <div className="grid-center">
          <div className="text-center max-w-3xl px-4">
            <h2 className="text-3xl font-bold mb-4">Prêt à vendre votre voiture ?</h2>
            <p className="text-xl mb-8">Obtenez une estimation gratuite en quelques minutes et vendez votre véhicule au meilleur prix.</p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors">
              Estimer ma voiture
            </button>
          </div>
        </div>
      </section>

      {/* Pied de page centré avec Flexbox */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-bold mb-4">DriveDeal</h3>
              <p className="text-gray-400 max-w-xs">La meilleure plateforme pour acheter et vendre des véhicules d'occasion en toute confiance.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-3">Navigation</h4>
                <ul className="space-y-2">
                  <li><Link href="/" className="text-gray-400 hover:text-white">Accueil</Link></li>
                  <li><Link href="/listings" className="text-gray-400 hover:text-white">Véhicules</Link></li>
                  <li><Link href="/sell" className="text-gray-400 hover:text-white">Vendre</Link></li>
                  <li><Link href="/about" className="text-gray-400 hover:text-white">À propos</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-3">Légal</h4>
                <ul className="space-y-2">
                  <li><Link href="/terms" className="text-gray-400 hover:text-white">Conditions</Link></li>
                  <li><Link href="/privacy" className="text-gray-400 hover:text-white">Confidentialité</Link></li>
                  <li><Link href="/cookies" className="text-gray-400 hover:text-white">Cookies</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-3">Contact</h4>
                <ul className="space-y-2">
                  <li className="text-gray-400">support@drivedeal.com</li>
                  <li className="text-gray-400">+33 1 23 45 67 89</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-500">
            <p>© {new Date().getFullYear()} DriveDeal. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExampleCenteredPage; 
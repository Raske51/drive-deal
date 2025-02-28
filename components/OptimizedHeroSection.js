import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Composant HeroSection optimisé avec image prioritaire
 * 
 * Ce composant affiche une section héro avec une image d'arrière-plan optimisée.
 * - L'image utilise priority={true} car c'est une image critique visible dès le chargement
 * - Les dimensions sont spécifiées pour éviter le CLS (Cumulative Layout Shift)
 * - L'attribut fetchpriority="high" est ajouté pour indiquer au navigateur de charger cette image en priorité
 */
const OptimizedHeroSection = () => {
  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
      {/* Image d'arrière-plan avec priority={true} car c'est une image critique */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2070&q=80"
          alt="Voiture de luxe"
          fill
          className="object-cover w-full"
          priority={true} // Image critique visible dès le chargement
          quality={90} // Qualité supérieure pour l'image principale
          placeholder="blur" // Effet de flou pendant le chargement
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          sizes="100vw" // L'image prend toute la largeur de l'écran
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      
      <div className="relative h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6">
          Trouvez la voiture de vos rêves
        </h1>
        <p className="text-xl sm:text-2xl text-white mb-8 max-w-3xl">
          Des milliers de véhicules sélectionnés avec soin pour une expérience d'achat exceptionnelle.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/search" 
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-300"
          >
            Rechercher une voiture
          </Link>
          <Link 
            href="/sell" 
            className="px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-bold rounded-lg transition-colors duration-300"
          >
            Vendre ma voiture
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OptimizedHeroSection; 
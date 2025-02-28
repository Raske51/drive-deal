import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Search, ArrowRight, Star, Shield, Clock } from 'lucide-react';
import Button from './UI/Button';

export default function HeroSection() {
  const [imageError, setImageError] = useState(false);
  
  // Fallback image en cas d'erreur
  const fallbackImage = "/images/hero-background.jpg";
  
  return (
    <div className="relative w-full h-[500px] md:h-[500px] sm:h-[300px] bg-cover bg-center flex items-center justify-center">
      {/* Image d'arrière-plan avec overlay */}
      <div className="absolute inset-0">
        <Image
          src={imageError ? fallbackImage : "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"}
          alt="Voiture de luxe"
          fill
          className="object-cover w-full"
          priority
          quality={90}
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      
      {/* Contenu */}
      <div className="relative text-white text-center max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold">Trouvez votre véhicule idéal</h1>
        <p className="text-lg mt-2">Sécurisé, rapide et garanti.</p>
        
        <div className="mt-4 flex justify-center">
          <Link href="/listings">
            <Button 
              variant="primary" 
              size="lg" 
              icon={<Search className="w-5 h-5" />}
              className="bg-blue-600 px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
            >
              Rechercher un véhicule
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3 group">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium text-lg">Véhicules vérifiés</h3>
              <p className="text-white/70 text-sm mt-1">Tous nos véhicules sont inspectés par nos experts</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 group">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Star className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium text-lg">Service premium</h3>
              <p className="text-white/70 text-sm mt-1">Une expérience d'achat personnalisée</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 group">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium text-lg">Processus rapide</h3>
              <p className="text-white/70 text-sm mt-1">Achetez ou vendez en quelques jours seulement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
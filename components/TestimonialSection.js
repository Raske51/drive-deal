import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export default function TestimonialSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const testimonials = [
    {
      id: 1,
      name: 'Sophie Martin',
      role: 'Propriétaire BMW X5',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250',
      quote: "J'ai trouvé ma voiture de rêve en moins d'une semaine grâce à Drive Deal. Le processus était incroyablement simple et transparent. Je recommande vivement !",
      rating: 5
    },
    {
      id: 2,
      name: 'Thomas Dubois',
      role: 'Propriétaire Audi Q7',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250',
      quote: "Le service client de Drive Deal est exceptionnel. Ils m'ont accompagné tout au long du processus d'achat et ont répondu à toutes mes questions. Une expérience 5 étoiles !",
      rating: 5
    },
    {
      id: 3,
      name: 'Emma Leroy',
      role: 'Propriétaire Tesla Model 3',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=250',
      quote: "Acheter ma Tesla sur Drive Deal a été la meilleure décision. Le véhicule était exactement comme décrit et le prix était imbattable. Je suis ravie de mon achat !",
      rating: 5
    }
  ];

  // Fonction pour passer au témoignage suivant
  const nextTestimonial = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }
  };

  // Fonction pour passer au témoignage précédent
  const prevTestimonial = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
    }
  };

  // Rotation automatique des témoignages
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Réinitialiser l'état d'animation après la transition
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsAnimating(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [activeIndex]);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
      <div className="container mx-auto px-4 relative">
        {/* Éléments décoratifs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
        
        {/* En-tête de section */}
        <div className="text-center mb-16 relative z-10" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Ce que disent nos clients
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez les expériences de nos clients satisfaits qui ont trouvé leur véhicule idéal grâce à Drive Deal.
          </p>
        </div>

        {/* Carrousel de témoignages */}
        <div className="max-w-5xl mx-auto relative" data-aos="fade-up" data-aos-delay="100">
          {/* Icône de citation */}
          <div className="absolute -top-10 left-0 text-primary/10 dark:text-primary/20">
            <Quote size={80} />
          </div>
          
          {/* Témoignage actif */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Image du client */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary p-1">
                  <div className="rounded-full overflow-hidden h-full w-full relative">
                    <Image
                      src={testimonials[activeIndex].image}
                      alt={testimonials[activeIndex].name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
              
              {/* Contenu du témoignage */}
              <div className="flex-1 text-center md:text-left">
                <div className="mb-4">
                  {/* Étoiles de notation */}
                  <div className="flex justify-center md:justify-start mb-3">
                    {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  
                  {/* Citation */}
                  <p className="text-gray-700 dark:text-gray-300 text-lg italic mb-4">
                    "{testimonials[activeIndex].quote}"
                  </p>
                  
                  {/* Informations du client */}
                  <div>
                    <h4 className="font-bold text-xl text-gray-900 dark:text-white">
                      {testimonials[activeIndex].name}
                    </h4>
                    <p className="text-primary">{testimonials[activeIndex].role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contrôles du carrousel */}
          <div className="flex justify-center mt-8 gap-4">
            <button
              onClick={prevTestimonial}
              disabled={isAnimating}
              className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary disabled:opacity-50"
              aria-label="Témoignage précédent"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            {/* Indicateurs */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => !isAnimating && setActiveIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? 'bg-primary w-8'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                  aria-label={`Aller au témoignage ${index + 1}`}
                />
              ))}
            </div>
            
            <button
              onClick={nextTestimonial}
              disabled={isAnimating}
              className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary disabled:opacity-50"
              aria-label="Témoignage suivant"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
 
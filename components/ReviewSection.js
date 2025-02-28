import React, { useState } from 'react';
import Image from 'next/image';
import { Star, ThumbsUp, MessageCircle, ChevronRight } from 'lucide-react';

export default function ReviewSection() {
  const [activeFilter, setActiveFilter] = useState('all');

  // Données simulées pour les avis
  const reviews = [
    {
      id: 1,
      user: {
        name: 'Alexandre Dupont',
        image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=200',
        verified: true
      },
      car: 'BMW X5 2023',
      rating: 5,
      date: '15 mars 2023',
      title: 'Expérience d\'achat exceptionnelle',
      content: 'Le processus d\'achat était incroyablement fluide. La voiture était exactement comme décrite, et le service client a été exceptionnel tout au long du processus. Je recommande vivement Drive Deal pour l\'achat de votre prochaine voiture de luxe.',
      likes: 24,
      comments: 3,
      type: 'purchase'
    },
    {
      id: 2,
      user: {
        name: 'Marie Laurent',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
        verified: true
      },
      car: 'Audi Q7 2022',
      rating: 4,
      date: '2 avril 2023',
      title: 'Très satisfaite de mon achat',
      content: 'J\'ai acheté ma Q7 il y a un mois et je suis très satisfaite. Le processus était simple et l\'équipe a été très professionnelle. La seule raison pour laquelle je ne donne pas 5 étoiles est que la livraison a été retardée d\'une journée.',
      likes: 18,
      comments: 2,
      type: 'purchase'
    },
    {
      id: 3,
      user: {
        name: 'Thomas Moreau',
        image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200',
        verified: true
      },
      car: 'Mercedes Classe E 2022',
      rating: 5,
      date: '18 février 2023',
      title: 'Vente rapide et sans tracas',
      content: 'J\'ai vendu ma Mercedes via Drive Deal et je suis impressionné par la rapidité et l\'efficacité du processus. J\'ai obtenu un prix équitable et tout a été géré de manière professionnelle. Je n\'hésiterai pas à utiliser à nouveau ce service.',
      likes: 32,
      comments: 5,
      type: 'sale'
    }
  ];

  // Filtrer les avis en fonction du filtre actif
  const filteredReviews = reviews.filter(review => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'purchase') return review.type === 'purchase';
    if (activeFilter === 'sale') return review.type === 'sale';
    if (activeFilter === 'highest') return review.rating === 5;
    return true;
  });

  // Fonction pour rendre les étoiles
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        {/* En-tête de section */}
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Avis de nos clients
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez ce que nos clients disent de leur expérience d'achat et de vente sur Drive Deal.
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap justify-center gap-2 mb-10" data-aos="fade-up" data-aos-delay="100">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeFilter === 'all'
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Tous les avis
          </button>
          <button
            onClick={() => setActiveFilter('purchase')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeFilter === 'purchase'
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Achats
          </button>
          <button
            onClick={() => setActiveFilter('sale')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeFilter === 'sale'
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Ventes
          </button>
          <button
            onClick={() => setActiveFilter('highest')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeFilter === 'highest'
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            5 étoiles
          </button>
        </div>

        {/* Liste des avis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-aos="fade-up" data-aos-delay="200">
          {filteredReviews.map((review) => (
            <div 
              key={review.id} 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
            >
              {/* En-tête de l'avis */}
              <div className="flex items-center mb-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4 border-2 border-primary">
                  <Image
                    src={review.user.image}
                    alt={review.user.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white">{review.user.name}</h3>
                    {review.user.verified && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-200">
                        Vérifié
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{review.car}</p>
                </div>
              </div>
              
              {/* Évaluation et date */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex">
                  {renderStars(review.rating)}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{review.date}</span>
              </div>
              
              {/* Contenu de l'avis */}
              <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{review.title}</h4>
              <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{review.content}</p>
              
              {/* Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex space-x-4">
                  <button className="flex items-center text-gray-500 hover:text-primary transition-colors">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span className="text-xs">{review.likes}</span>
                  </button>
                  <button className="flex items-center text-gray-500 hover:text-primary transition-colors">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs">{review.comments}</span>
                  </button>
                </div>
                <button className="text-primary text-sm font-medium flex items-center hover:underline">
                  Lire plus
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Bouton pour voir plus d'avis */}
        <div className="mt-12 text-center" data-aos="fade-up" data-aos-delay="300">
          <a
            href="/reviews"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-primary border border-primary rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:bg-primary hover:text-white"
          >
            Voir tous les avis
            <ChevronRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
} 
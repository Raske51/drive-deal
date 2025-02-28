import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTheme } from '../../hooks/useTheme';
import { 
  Calendar, 
  Fuel, 
  Gauge, 
  Settings, 
  MapPin, 
  Star, 
  Heart, 
  Share, 
  Phone, 
  Mail, 
  ChevronLeft, 
  ChevronRight,
  Check,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Car,
  MessageCircle,
  ChevronUp
} from 'lucide-react';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CarCard from '../../components/CarCard';
import Button from '../../components/UI/Button';

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
    engine: '3.0L 6-cylindres',
    power: '394 ch',
    acceleration: '5.6s (0-100 km/h)',
    consumption: '7.5L/100km',
    color: 'Noir Saphir',
    bodyType: 'SUV',
    doors: 5,
    seats: 5,
    warranty: '3 ans',
    location: 'Paris, France',
    seller: {
      name: 'Premium Auto Paris',
      type: 'Professionnel',
      rating: 4.8,
      reviewCount: 124,
      phone: '+33 1 23 45 67 89',
      email: 'contact@premiumauto.fr',
    },
    description: "BMW X5 xDrive45e Hybride rechargeable en excellent état. Ce SUV premium combine puissance, confort et économie de carburant grâce à sa motorisation hybride. Équipé de nombreuses options haut de gamme, il offre une expérience de conduite exceptionnelle. Véhicule non-fumeur, entretenu régulièrement dans le réseau BMW.",
    features: [
      'Toit panoramique',
      'Sièges chauffants et ventilés',
      'Système de navigation professionnel',
      'Caméra 360°',
      'Assistance au stationnement',
      'Système audio Harman Kardon',
      'Affichage tête haute',
      'Régulateur de vitesse adaptatif',
      'Jantes alliage 21 pouces',
      'Suspension pneumatique',
      'Apple CarPlay & Android Auto',
      'Chargeur à induction',
    ],
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2074&q=80',
    ],
    rating: 4.8,
    reviewCount: 24,
    isFeatured: true,
    isVerified: true,
  },
  // Autres véhicules...
];

// Données de démonstration pour les véhicules similaires
const similarCarsData = [
  {
    id: '2',
    make: 'Mercedes',
    model: 'GLE',
    year: 2023,
    price: 92500,
    mileage: 3000,
    fuelType: 'Diesel',
    transmission: 'Automatique',
    location: 'Lyon, France',
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    rating: 4.7,
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
    model: 'Model X',
    year: 2023,
    price: 109900,
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
];

export default function CarDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { darkMode } = useTheme();
  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [similarCars, setSimilarCars] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    setIsLoading(true);
    
    // Simuler un chargement des données
    setTimeout(() => {
      const foundCar = carsData.find(car => car.id === id);
      
      if (foundCar) {
        setCar(foundCar);
        setSimilarCars(similarCarsData);
      } else {
        // Rediriger vers la page 404 si la voiture n'est pas trouvée
        router.push('/404');
      }
      
      setIsLoading(false);
    }, 500);
  }, [router.isReady, id, router]);

  // Détecter le défilement pour afficher le bouton de retour en haut
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nextImage = () => {
    if (!car) return;
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % car.images.length);
  };

  const prevImage = () => {
    if (!car) return;
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + car.images.length) % car.images.length);
  };

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const openImageModal = () => {
    setIsImageModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Formater le prix avec des espaces pour les milliers
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Formater le kilométrage avec des espaces pour les milliers
  const formatMileage = (mileage) => {
    return mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Fallback image en cas d'erreur
  const fallbackImage = "/images/car-placeholder.jpg";

  if (isLoading || !car) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pb-16 pt-24 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="flex h-96 items-center justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="ml-4 text-lg font-medium text-gray-600 dark:text-gray-300 animate-pulse">Chargement des informations...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`${car.make} ${car.model} (${car.year}) | DriveDeal`}</title>
        <meta name="description" content={`${car.make} ${car.model} ${car.year} - ${car.fuelType}, ${car.mileage} km, ${formatPrice(car.price)} €. ${car.description.substring(0, 150)}...`} />
      </Head>

      <div className={darkMode ? 'dark' : ''}>
        <Header />

        <main className="min-h-screen bg-gray-50 pb-16 pt-24 dark:bg-gray-900">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Fil d'Ariane */}
            <div className="mb-6 flex items-center text-sm text-gray-500 dark:text-gray-400 animate-fadeIn">
              <Link href="/" className="hover:text-primary transition-colors">
                Accueil
              </Link>
              <span className="mx-2">/</span>
              <Link href="/listings" className="hover:text-primary transition-colors">
                Véhicules
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-700 dark:text-gray-300">
                {car.make} {car.model}
              </span>
            </div>

            {/* Bouton retour */}
            <div className="mb-4 animate-fadeIn">
              <Button 
                onClick={() => router.back()} 
                variant="outline" 
                size="sm" 
                icon={<ArrowLeft className="h-4 w-4" />}
                iconPosition="left"
              >
                Retour aux résultats
              </Button>
            </div>

            {/* Titre et actions */}
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center animate-fadeIn">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {car.make} {car.model} {car.year}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-gray-600 dark:text-gray-400">
                  <span className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4 text-primary" />
                    {car.location}
                  </span>
                  <span className="flex items-center">
                    <Gauge className="mr-1 h-4 w-4 text-primary" />
                    {formatMileage(car.mileage)} km
                  </span>
                  <span className="flex items-center">
                    <Fuel className="mr-1 h-4 w-4 text-primary" />
                    {car.fuelType}
                  </span>
                  {car.isVerified && (
                    <span className="flex items-center text-green-600 dark:text-green-400">
                      <ShieldCheck className="mr-1 h-4 w-4" />
                      Vérifié
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={toggleFavorite}
                  className={`flex items-center rounded-md border ${isFavorite ? 'border-primary bg-primary/10 text-primary' : 'border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'} px-4 py-2 transition-colors hover:border-primary hover:text-primary`}
                  aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  <Heart className={`mr-2 h-5 w-5 ${isFavorite ? 'fill-primary' : ''}`} />
                  {isFavorite ? 'Favori' : 'Favoris'}
                </button>
                <button className="flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                  <Share className="mr-2 h-5 w-5" />
                  Partager
                </button>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Galerie d'images */}
              <div className="lg:col-span-2 animate-fadeIn">
                <div 
                  className="relative mb-4 h-[400px] w-full overflow-hidden rounded-lg cursor-pointer shadow-md"
                  onClick={openImageModal}
                >
                  <Image
                    src={imageError ? fallbackImage : car.images[currentImageIndex]}
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                    priority
                    onError={() => setImageError(true)}
                    quality={90}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-700 shadow-md transition-all hover:bg-white hover:scale-110 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-800"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-700 shadow-md transition-all hover:bg-white hover:scale-110 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-800"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <div className="absolute bottom-4 right-4 rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-800/80 dark:text-gray-300">
                    {currentImageIndex + 1}/{car.images.length}
                  </div>
                </div>

                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                  {car.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => selectImage(index)}
                      className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md transition-all ${
                        currentImageIndex === index 
                          ? 'ring-2 ring-primary scale-105' 
                          : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${car.make} ${car.model} - Miniature ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>

                {/* Onglets d'information */}
                <div className="mt-8 rounded-lg bg-white shadow-md dark:bg-gray-800 overflow-hidden">
                  <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setActiveTab('description')}
                      className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                        activeTab === 'description'
                          ? 'bg-primary/10 text-primary border-b-2 border-primary'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      Description
                    </button>
                    <button
                      onClick={() => setActiveTab('specifications')}
                      className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                        activeTab === 'specifications'
                          ? 'bg-primary/10 text-primary border-b-2 border-primary'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      Caractéristiques
                    </button>
                    <button
                      onClick={() => setActiveTab('features')}
                      className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                        activeTab === 'features'
                          ? 'bg-primary/10 text-primary border-b-2 border-primary'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      Équipements
                    </button>
                  </div>

                  <div className="p-6">
                    {activeTab === 'description' && (
                      <div className="animate-fadeIn">
                        <p className="text-gray-700 dark:text-gray-300">{car.description}</p>
                      </div>
                    )}

                    {activeTab === 'specifications' && (
                      <div className="animate-fadeIn">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Calendar className="mr-2 h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Année</p>
                              <p className="font-medium text-gray-900 dark:text-white">{car.year}</p>
                            </div>
                          </div>
                          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Gauge className="mr-2 h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Kilométrage</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {formatMileage(car.mileage)} km
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Fuel className="mr-2 h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Carburant</p>
                              <p className="font-medium text-gray-900 dark:text-white">{car.fuelType}</p>
                            </div>
                          </div>
                          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Settings className="mr-2 h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Transmission</p>
                              <p className="font-medium text-gray-900 dark:text-white">{car.transmission}</p>
                            </div>
                          </div>
                          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Settings className="mr-2 h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Moteur</p>
                              <p className="font-medium text-gray-900 dark:text-white">{car.engine}</p>
                            </div>
                          </div>
                          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Settings className="mr-2 h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Puissance</p>
                              <p className="font-medium text-gray-900 dark:text-white">{car.power}</p>
                            </div>
                          </div>
                          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Zap className="mr-2 h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Accélération</p>
                              <p className="font-medium text-gray-900 dark:text-white">{car.acceleration}</p>
                            </div>
                          </div>
                          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Fuel className="mr-2 h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Consommation</p>
                              <p className="font-medium text-gray-900 dark:text-white">{car.consumption}</p>
                            </div>
                          </div>
                          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Car className="mr-2 h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Type de carrosserie</p>
                              <p className="font-medium text-gray-900 dark:text-white">{car.bodyType}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'features' && (
                      <div className="animate-fadeIn">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                          {car.features.map((feature, index) => (
                            <div 
                              key={index} 
                              className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                              style={{ animationDelay: `${index * 0.05}s` }}
                            >
                              <Check className="mr-2 h-5 w-5 text-green-500" />
                              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations de contact et prix */}
              <div className="space-y-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                  <div className="mb-4 text-center">
                    <span className="text-3xl font-bold text-primary">{formatPrice(car.price)} €</span>
                    {car.isVerified && (
                      <div className="mt-2 flex items-center justify-center text-green-600 dark:text-green-400">
                        <ShieldCheck className="mr-1 h-4 w-4" />
                        <span className="text-sm">Véhicule vérifié par nos experts</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    is3D={true}
                    className="mb-3 w-full bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
                    icon={<MessageCircle className="h-4 w-4" />}
                    iconPosition="left"
                  >
                    Contacter le vendeur
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    icon={<Car className="h-4 w-4" />}
                    iconPosition="left"
                  >
                    Demander un essai
                  </Button>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Vendeur</h2>
                  <div className="mb-4 flex items-center">
                    <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {car.seller.type === 'Professionnel' ? 'P' : 'P'}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{car.seller.name}</h3>
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {car.seller.rating} ({car.seller.reviewCount} avis)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{car.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="mr-2 h-5 w-5 text-gray-500" />
                      <a href={`tel:${car.seller.phone}`} className="text-gray-700 hover:text-primary dark:text-gray-300 transition-colors">
                        {car.seller.phone}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Mail className="mr-2 h-5 w-5 text-gray-500" />
                      <a href={`mailto:${car.seller.email}`} className="text-gray-700 hover:text-primary dark:text-gray-300 transition-colors">
                        {car.seller.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 p-6 shadow-md dark:from-primary/10 dark:to-primary/5">
                  <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Pourquoi acheter avec Drive Deal ?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <ShieldCheck className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Véhicules inspectés et garantis</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Essai sans engagement</span>
                    </li>
                    <li className="flex items-start">
                      <Zap className="mr-2 h-5 w-5 text-primary mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Processus d'achat simplifié</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Véhicules similaires */}
            <div className="mt-16 py-6 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Véhicules similaires</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {similarCars.map((car, index) => (
                  <div 
                    key={car.id} 
                    className="animate-fadeIn" 
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  >
                    <CarCard car={car} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Modal d'image plein écran */}
        {isImageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" onClick={closeImageModal}>
            <button 
              className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
              onClick={closeImageModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative h-[80vh] w-[90vw] max-w-7xl" onClick={(e) => e.stopPropagation()}>
              <Image
                src={imageError ? fallbackImage : car.images[currentImageIndex]}
                alt={`${car.make} ${car.model}`}
                fill
                className="object-contain"
                sizes="90vw"
              />
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/30 transition-colors"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/30 transition-colors"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/20 px-4 py-2 text-white">
                {currentImageIndex + 1} / {car.images.length}
              </div>
            </div>
          </div>
        )}

        {/* Bouton de retour en haut */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 rounded-full bg-primary p-3 text-white shadow-lg transition-all duration-300 hover:bg-primary-dark ${
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
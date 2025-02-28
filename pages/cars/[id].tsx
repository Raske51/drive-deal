import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import Layout from '../../components/layout/Layout';
import { Car } from '../../models/Car';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../utils/mongodb';

interface CarDetailsProps {
  car: Car;
  isFavorite: boolean;
}

export default function CarDetails({ car, isFavorite: initialIsFavorite }: CarDetailsProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  const handleFavoriteClick = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour ajouter des favoris');
      return;
    }

    try {
      setIsLoading(true);
      if (isFavorite) {
        await axios.delete('/api/favorites', { data: { carId: car._id } });
        toast.success('Retiré des favoris');
      } else {
        await axios.post('/api/favorites', { carId: car._id });
        toast.success('Ajouté aux favoris');
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === car.images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? car.images.length - 1 : prev - 1
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Galerie d'images */}
          <div className="relative h-96">
            {car.images.length > 0 ? (
              <>
                <Image
                  src={car.images[currentImageIndex]}
                  alt={`${car.title} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover"
                />
                {car.images.length > 1 && (
                  <>
                    <button
                      onClick={previousImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <button
              onClick={handleFavoriteClick}
              disabled={isLoading}
              className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className={`w-6 h-6 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Informations */}
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{car.title}</h1>
                <p className="text-3xl font-bold text-blue-600">{formatPrice(car.price)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Publié le {formatDate(car.createdAt)}
                </p>
                <p className="text-sm text-gray-500">
                  Référence: {car._id}
                </p>
              </div>
            </div>

            {/* Caractéristiques principales */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Année</h3>
                <p className="mt-1 text-lg text-gray-900">{car.year}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Kilométrage</h3>
                <p className="mt-1 text-lg text-gray-900">{car.mileage.toLocaleString('fr-FR')} km</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Carburant</h3>
                <p className="mt-1 text-lg text-gray-900">
                  {car.fuel.charAt(0).toUpperCase() + car.fuel.slice(1)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Transmission</h3>
                <p className="mt-1 text-lg text-gray-900">
                  {car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1)}
                </p>
              </div>
            </div>

            {/* Détails techniques */}
            {car.technicalDetails && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails techniques</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {car.technicalDetails.power && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Puissance</h3>
                      <p className="mt-1 text-gray-900">{car.technicalDetails.power} ch</p>
                    </div>
                  )}
                  {car.technicalDetails.engineSize && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Cylindrée</h3>
                      <p className="mt-1 text-gray-900">{car.technicalDetails.engineSize} cm³</p>
                    </div>
                  )}
                  {car.technicalDetails.doors && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Portes</h3>
                      <p className="mt-1 text-gray-900">{car.technicalDetails.doors}</p>
                    </div>
                  )}
                  {car.technicalDetails.color && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Couleur</h3>
                      <p className="mt-1 text-gray-900">{car.technicalDetails.color}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{car.description}</p>
            </div>

            {/* Équipements */}
            {car.features.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Équipements</h2>
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                  {car.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Informations vendeur */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations vendeur</h2>
              <div className="flex items-start space-x-6">
                <div className="flex-1">
                  <p className="text-gray-700">
                    <span className="font-medium">Type : </span>
                    {car.seller.type.charAt(0).toUpperCase() + car.seller.type.slice(1)}
                  </p>
                  {car.seller.name && (
                    <p className="text-gray-700 mt-2">
                      <span className="font-medium">Nom : </span>
                      {car.seller.name}
                    </p>
                  )}
                  <p className="text-gray-700 mt-2">
                    <span className="font-medium">Localisation : </span>
                    {car.location.city} ({car.location.department})
                  </p>
                </div>
                {car.seller.phone && (
                  <a
                    href={`tel:${car.seller.phone}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Appeler le vendeur
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  try {
    const { db } = await connectToDatabase();
    const carId = params?.id as string;

    if (!ObjectId.isValid(carId)) {
      return {
        notFound: true
      };
    }

    const car = await db.collection('cars').findOne({ _id: new ObjectId(carId) });

    if (!car) {
      return {
        notFound: true
      };
    }

    // Vérifier si la voiture est dans les favoris de l'utilisateur
    let isFavorite = false;
    const token = req.cookies.token;

    if (token) {
      try {
        const user = await db.collection('users').findOne({
          favorites: carId
        });
        isFavorite = !!user;
      } catch (error) {
        console.error('Error checking favorites:', error);
      }
    }

    return {
      props: {
        car: JSON.parse(JSON.stringify(car)), // Serialization pour Next.js
        isFavorite
      }
    };
  } catch (error) {
    console.error('Error fetching car details:', error);
    return {
      notFound: true
    };
  }
}; 
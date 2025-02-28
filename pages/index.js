import Head from 'next/head';
import { useTheme } from '../hooks/useTheme';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import SearchBar from '../components/SearchBar';
import FeaturedCars from '../components/FeaturedCars';
import TestimonialSection from '../components/TestimonialSection';
import CarComparison from '../components/CarComparison';

export default function Home() {
  const { darkMode } = useTheme();
  
  return (
    <>
      <Head>
        <title>DriveDeal - Achat et vente de véhicules premium</title>
        <meta name="description" content="DriveDeal - Trouvez la voiture de vos rêves parmi notre sélection de véhicules premium. Achat, vente et comparaison de véhicules d'exception." />
        <meta name="keywords" content="voiture, automobile, premium, luxe, occasion, achat, vente" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={darkMode ? 'dark' : ''}>
        <Header />

        <main className="pt-20">
          {/* Section Hero avec recherche */}
          <HeroSection />
          
          <div className="container -mt-24 relative z-20 px-4 sm:px-6 lg:px-8">
            <SearchBar className="mb-12" />
          </div>
          
          {/* Section des véhicules en vedette */}
          <FeaturedCars />
          
          {/* Section de comparaison */}
          <CarComparison />
          
          {/* Section des avis clients */}
          <TestimonialSection />
        </main>

        <Footer />
      </div>
    </>
  );
}
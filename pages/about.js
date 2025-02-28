import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useTheme } from '../hooks/useTheme';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Users, Award, Shield, Clock, Check, Car, Tool, Headphones } from 'lucide-react';

export default function About() {
  const { darkMode } = useTheme();
  
  const teamMembers = [
    {
      name: 'Alexandre Dupont',
      role: 'Fondateur & CEO',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      bio: 'Passionné d\'automobiles depuis son plus jeune âge, Alexandre a fondé Drive Deal avec la vision de transformer l\'expérience d\'achat de véhicules premium.'
    },
    {
      name: 'Sophie Martin',
      role: 'Directrice Marketing',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      bio: 'Avec plus de 10 ans d\'expérience dans le marketing automobile, Sophie dirige toutes les initiatives marketing et de communication de Drive Deal.'
    },
    {
      name: 'Thomas Rousseau',
      role: 'Expert Automobile',
      image: 'https://randomuser.me/api/portraits/men/67.jpg',
      bio: 'Ancien pilote et mécanicien, Thomas apporte son expertise technique pour garantir la qualité de chaque véhicule proposé sur notre plateforme.'
    },
    {
      name: 'Émilie Bernard',
      role: 'Responsable Service Client',
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      bio: 'Émilie veille à ce que chaque client bénéficie d\'une expérience exceptionnelle, de la recherche de véhicule jusqu\'au service après-vente.'
    }
  ];
  
  const values = [
    {
      icon: <Shield className="w-12 h-12 text-primary" />,
      title: 'Confiance',
      description: 'Nous établissons des relations de confiance durables avec nos clients grâce à la transparence et l\'honnêteté.'
    },
    {
      icon: <Award className="w-12 h-12 text-primary" />,
      title: 'Excellence',
      description: 'Nous nous engageons à offrir une qualité exceptionnelle dans chaque aspect de notre service.'
    },
    {
      icon: <Users className="w-12 h-12 text-primary" />,
      title: 'Communauté',
      description: 'Nous créons une communauté de passionnés d\'automobiles partageant les mêmes valeurs.'
    },
    {
      icon: <Clock className="w-12 h-12 text-primary" />,
      title: 'Efficacité',
      description: 'Nous valorisons le temps de nos clients en simplifiant et accélérant le processus d\'achat et de vente.'
    }
  ];
  
  return (
    <>
      <Head>
        <title>À propos de Drive Deal | Notre histoire et notre équipe</title>
        <meta name="description" content="Découvrez l'histoire de Drive Deal, notre mission, nos valeurs et l'équipe passionnée qui travaille pour vous offrir la meilleure expérience automobile." />
      </Head>
      
      <div className={darkMode ? 'dark' : ''}>
        <Header />
        
        <main className="pt-20">
          {/* Section Hero */}
          <section className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
            <div className="absolute inset-0 opacity-20">
              <Image
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Voiture de luxe"
                fill
                className="object-cover"
              />
            </div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fadeIn">À propos de Drive Deal</h1>
                <p className="text-xl text-gray-300 mb-8 animate-slideUp">
                  Nous redéfinissons l'expérience d'achat et de vente de véhicules premium en France.
                </p>
              </div>
            </div>
          </section>
          
          {/* Section Notre Histoire */}
          <section className="py-16 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="animate-slideRight">
                  <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Notre Histoire</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Fondée en 2020 par Alexandre Dupont, Drive Deal est née d'une passion pour les automobiles d'exception et d'une vision claire : transformer l'expérience d'achat et de vente de véhicules premium en France.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Frustré par les processus traditionnels souvent longs et complexes, Alexandre a imaginé une plateforme qui combine l'expertise automobile, la technologie moderne et un service client exceptionnel.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Aujourd'hui, Drive Deal est devenue la référence pour les passionnés d'automobiles à la recherche de véhicules d'exception, avec plus de 10 000 clients satisfaits et une sélection rigoureuse des meilleurs véhicules du marché.
                  </p>
                </div>
                <div className="relative h-96 rounded-xl overflow-hidden shadow-xl animate-slideLeft">
                  <Image
                    src="https://images.unsplash.com/photo-1560253414-f65d1f5a1a37?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Fondateur de Drive Deal"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </section>
          
          {/* Section Notre Mission */}
          <section className="py-16 bg-gray-100 dark:bg-gray-800">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Notre Mission</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Chez Drive Deal, notre mission est de connecter les passionnés d'automobiles avec les véhicules de leurs rêves, tout en simplifiant le processus d'achat et de vente grâce à la technologie et à l'expertise humaine.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, index) => (
                  <div 
                    key={index} 
                    className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow animate-fadeIn"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="mb-4">{value.icon}</div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{value.title}</h3>
                    <p className="text-gray-700 dark:text-gray-400">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* Section Notre Équipe */}
          <section className="py-16 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Notre Équipe</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Drive Deal est portée par une équipe de passionnés d'automobiles, d'experts en technologie et de professionnels du service client dévoués à votre satisfaction.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {teamMembers.map((member, index) => (
                  <div 
                    key={index} 
                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow animate-fadeIn"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="relative h-64">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">{member.name}</h3>
                      <p className="text-primary font-medium mb-3">{member.role}</p>
                      <p className="text-gray-700 dark:text-gray-400">{member.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* Section Pourquoi Nous Choisir */}
          <section className="py-16 bg-gray-100 dark:bg-gray-800">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Pourquoi Nous Choisir</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Drive Deal se distingue par son engagement envers l'excellence et la satisfaction client à chaque étape du processus.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md animate-slideRight">
                  <div className="mr-4 mt-1">
                    <Car className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Sélection Rigoureuse</h3>
                    <p className="text-gray-700 dark:text-gray-400">
                      Chaque véhicule sur notre plateforme est soigneusement inspecté et sélectionné selon des critères stricts de qualité et d'authenticité.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md animate-slideLeft">
                  <div className="mr-4 mt-1">
                    <Tool className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Expertise Technique</h3>
                    <p className="text-gray-700 dark:text-gray-400">
                      Notre équipe d'experts automobiles vérifie chaque détail technique pour garantir la fiabilité et la performance des véhicules.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md animate-slideRight">
                  <div className="mr-4 mt-1">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Transparence Totale</h3>
                    <p className="text-gray-700 dark:text-gray-400">
                      Nous fournissons un historique complet et transparent pour chaque véhicule, sans surprises ni informations cachées.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md animate-slideLeft">
                  <div className="mr-4 mt-1">
                    <Headphones className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Service Personnalisé</h3>
                    <p className="text-gray-700 dark:text-gray-400">
                      Notre équipe de conseillers dédiés vous accompagne à chaque étape, de la recherche à la livraison de votre véhicule.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
} 
import React from 'react';
import Head from 'next/head';
import ListingsPageExample from '../components/ListingsPageExample';
import Link from 'next/link';

/**
 * Page d'exemple pour démontrer les corrections d'espacement dans la page des listings
 */
const ListingsExamplePage = () => {
  return (
    <>
      <Head>
        <title>Exemple de Listings | DriveDeal</title>
        <meta name="description" content="Exemple de page de listings avec corrections d'espacement" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-blue-600 text-white py-4">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">DriveDeal</h1>
              <Link href="/" className="text-white hover:underline">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </header>
        
        <main>
          <ListingsPageExample />
        </main>
        
        <footer className="bg-gray-800 text-white py-6 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p>© {new Date().getFullYear()} DriveDeal. Tous droits réservés.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ListingsExamplePage; 
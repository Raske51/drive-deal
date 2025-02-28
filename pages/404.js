import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useTheme } from '../hooks/useTheme';
import { Home, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/UI/Button';

export default function Custom404() {
  const { darkMode } = useTheme();

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Head>
        <title>Page non trouvée | DriveDeal</title>
        <meta name="description" content="La page que vous recherchez n'existe pas ou a été déplacée." />
      </Head>

      <Header />

      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-24 dark:bg-gray-900">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-2 text-9xl font-bold text-primary">404</h1>
          <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Page non trouvée</h2>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 justify-center">
            <Button
              variant="primary"
              size="lg"
              icon={<Home className="h-5 w-5" />}
              iconPosition="left"
              is3D={true}
              href="/"
            >
              Retour à l'accueil
            </Button>
            <Button
              variant="outline"
              size="lg"
              icon={<ArrowLeft className="h-5 w-5" />}
              iconPosition="left"
              onClick={() => window.history.back()}
            >
              Page précédente
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 

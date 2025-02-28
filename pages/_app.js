import { AuthProvider } from '../hooks/useAuth';
import { ThemeProvider } from '../hooks/useTheme';
import '../styles/globals.css';
import '../styles/ui-improvements.css';
import '../styles/responsive.css';
import '../styles/alignment-fixes.css';
import '../styles/listings-fixes.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>DriveDeal - Achat & Vente de Voitures</title>
        <meta name="description" content="Trouvez la meilleure voiture d'occasion ou neuve sur DriveDeal. Des milliers d'annonces automobiles mises à jour en temps réel." />
        <meta name="keywords" content="voiture, occasion, achat voiture, vente voiture, automobile, annonces auto" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://drive-deal.pages.dev/" />
        <meta property="og:title" content="DriveDeal - Achetez et Vendez vos Voitures Facilement" />
        <meta property="og:description" content="Des milliers d'annonces automobiles mises à jour en temps réel. Trouvez la voiture de vos rêves sur DriveDeal." />
        <meta property="og:image" content="https://drive-deal.pages.dev/images/og-image.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://drive-deal.pages.dev/" />
        <meta name="twitter:title" content="DriveDeal - Achetez et Vendez vos Voitures Facilement" />
        <meta name="twitter:description" content="Des milliers d'annonces automobiles mises à jour en temps réel. Trouvez la voiture de vos rêves sur DriveDeal." />
        <meta name="twitter:image" content="https://drive-deal.pages.dev/images/twitter-image.jpg" />
        
        {/* Autres balises meta importantes */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="French" />
        <meta name="revisit-after" content="7 days" />
        <meta name="author" content="DriveDeal" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://drive-deal.pages.dev/" />
      </Head>
      <AuthProvider>
        <ThemeProvider>
          <Component {...pageProps} />
        </ThemeProvider>
      </AuthProvider>
    </>
  );
}
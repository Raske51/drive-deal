import React from 'react';
import Head from 'next/head';
import { useTheme } from '../hooks/useTheme';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Privacy() {
  const { darkMode } = useTheme();
  
  return (
    <>
      <Head>
        <title>Politique de confidentialité | Drive Deal</title>
        <meta name="description" content="Découvrez comment Drive Deal protège vos données personnelles et respecte votre vie privée." />
      </Head>
      
      <div className={darkMode ? 'dark' : ''}>
        <Header />
        
        <main className="pt-20">
          {/* Section Hero */}
          <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fadeIn">Politique de confidentialité</h1>
                <p className="text-xl text-gray-300 mb-8 animate-slideUp">
                  Nous accordons une importance particulière à la protection de vos données personnelles.
                </p>
              </div>
            </div>
          </section>
          
          {/* Contenu */}
          <section className="py-16 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto prose dark:prose-invert prose-lg">
                <p>
                  Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                
                <h2>1. Introduction</h2>
                <p>
                  Chez Drive Deal, nous nous engageons à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations personnelles lorsque vous utilisez notre site web, nos services et nos applications.
                </p>
                <p>
                  En utilisant nos services, vous acceptez les pratiques décrites dans cette politique de confidentialité. Nous vous encourageons à la lire attentivement pour comprendre nos pratiques concernant vos informations personnelles.
                </p>
                
                <h2>2. Informations que nous collectons</h2>
                <p>
                  Nous collectons différents types d'informations vous concernant, notamment :
                </p>
                <ul>
                  <li>
                    <strong>Informations que vous nous fournissez :</strong> Lorsque vous créez un compte, effectuez un achat, vendez un véhicule, remplissez un formulaire ou communiquez avec nous, nous collectons des informations telles que votre nom, adresse email, numéro de téléphone, adresse postale, informations de paiement et détails sur votre véhicule.
                  </li>
                  <li>
                    <strong>Informations automatiques :</strong> Lorsque vous utilisez notre site web ou nos applications, nous collectons automatiquement certaines informations, comme votre adresse IP, type de navigateur, pages visitées, temps passé sur ces pages, et autres données de diagnostic.
                  </li>
                  <li>
                    <strong>Informations de localisation :</strong> Avec votre consentement, nous pouvons collecter des informations sur votre localisation précise pour vous fournir des services basés sur la localisation.
                  </li>
                </ul>
                
                <h2>3. Comment nous utilisons vos informations</h2>
                <p>
                  Nous utilisons les informations que nous collectons pour :
                </p>
                <ul>
                  <li>Fournir, maintenir et améliorer nos services</li>
                  <li>Traiter vos transactions et gérer votre compte</li>
                  <li>Vous envoyer des confirmations, factures et autres communications liées à votre utilisation de nos services</li>
                  <li>Vous envoyer des communications marketing et promotionnelles (avec votre consentement)</li>
                  <li>Répondre à vos questions et demandes d'assistance</li>
                  <li>Détecter, prévenir et résoudre les problèmes techniques et de sécurité</li>
                  <li>Se conformer aux obligations légales</li>
                </ul>
                
                <h2>4. Partage de vos informations</h2>
                <p>
                  Nous pouvons partager vos informations personnelles avec :
                </p>
                <ul>
                  <li>
                    <strong>Prestataires de services :</strong> Nous travaillons avec des entreprises tierces qui nous aident à exploiter notre entreprise et à vous fournir nos services (traitement des paiements, hébergement, analyse de données, etc.).
                  </li>
                  <li>
                    <strong>Partenaires commerciaux :</strong> Nous pouvons partager vos informations avec nos partenaires commerciaux pour vous offrir certains services ou promotions.
                  </li>
                  <li>
                    <strong>Conformité légale :</strong> Nous pouvons divulguer vos informations si la loi l'exige ou si nous croyons de bonne foi que cette divulgation est nécessaire pour protéger nos droits, votre sécurité ou celle d'autrui.
                  </li>
                </ul>
                
                <h2>5. Vos droits et choix</h2>
                <p>
                  Conformément au Règlement Général sur la Protection des Données (RGPD) et à d'autres lois applicables, vous disposez de certains droits concernant vos données personnelles :
                </p>
                <ul>
                  <li>Droit d'accès à vos données personnelles</li>
                  <li>Droit de rectification des données inexactes</li>
                  <li>Droit à l'effacement de vos données</li>
                  <li>Droit à la limitation du traitement</li>
                  <li>Droit à la portabilité des données</li>
                  <li>Droit d'opposition au traitement</li>
                  <li>Droit de retirer votre consentement à tout moment</li>
                </ul>
                <p>
                  Pour exercer ces droits, veuillez nous contacter à l'adresse indiquée dans la section "Nous contacter" ci-dessous.
                </p>
                
                <h2>6. Sécurité des données</h2>
                <p>
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos informations personnelles contre la perte, l'utilisation abusive, l'accès non autorisé, la divulgation, l'altération et la destruction.
                </p>
                
                <h2>7. Conservation des données</h2>
                <p>
                  Nous conservons vos informations personnelles aussi longtemps que nécessaire pour fournir les services que vous avez demandés, ou pour d'autres fins essentielles telles que le respect de nos obligations légales, la résolution des litiges et l'application de nos politiques.
                </p>
                
                <h2>8. Transferts internationaux</h2>
                <p>
                  Vos informations personnelles peuvent être transférées et traitées dans des pays autres que celui dans lequel vous résidez. Ces pays peuvent avoir des lois de protection des données différentes de celles de votre pays.
                </p>
                <p>
                  Si nous transférons vos informations personnelles en dehors de l'Espace Économique Européen (EEE), nous prendrons des mesures appropriées pour garantir que vos informations personnelles bénéficient d'un niveau de protection adéquat.
                </p>
                
                <h2>9. Modifications de cette politique</h2>
                <p>
                  Nous pouvons mettre à jour cette politique de confidentialité de temps à autre en réponse à des changements juridiques, techniques ou commerciaux. Lorsque nous mettrons à jour notre politique de confidentialité, nous prendrons les mesures appropriées pour vous informer, en fonction de l'importance des changements apportés.
                </p>
                
                <h2>10. Nous contacter</h2>
                <p>
                  Si vous avez des questions ou des préoccupations concernant cette politique de confidentialité ou nos pratiques en matière de données, veuillez nous contacter à :
                </p>
                <p>
                  Drive Deal<br />
                  123 Avenue des Champs-Élysées<br />
                  75008 Paris, France<br />
                  Email : privacy@drivedeal.fr<br />
                  Téléphone : +33 1 23 45 67 89
                </p>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
} 
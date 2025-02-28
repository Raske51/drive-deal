import React from 'react';
import Head from 'next/head';
import { useTheme } from '../hooks/useTheme';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Cookies() {
  const { darkMode } = useTheme();
  
  return (
    <>
      <Head>
        <title>Politique de cookies | Drive Deal</title>
        <meta name="description" content="Découvrez comment Drive Deal utilise les cookies pour améliorer votre expérience sur notre site." />
      </Head>
      
      <div className={darkMode ? 'dark' : ''}>
        <Header />
        
        <main className="pt-20">
          {/* Section Hero */}
          <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fadeIn">Politique de cookies</h1>
                <p className="text-xl text-gray-300 mb-8 animate-slideUp">
                  Comprendre comment nous utilisons les cookies pour améliorer votre expérience.
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
                  Cette politique de cookies explique ce que sont les cookies, comment Drive Deal les utilise, et quels sont vos choix concernant leur utilisation. Cette politique doit être lue conjointement avec notre Politique de confidentialité.
                </p>
                
                <h2>2. Qu'est-ce qu'un cookie ?</h2>
                <p>
                  Un cookie est un petit fichier texte qui est stocké sur votre ordinateur ou appareil mobile lorsque vous visitez un site web. Les cookies sont largement utilisés pour faire fonctionner les sites web ou les rendre plus efficaces, ainsi que pour fournir des informations aux propriétaires du site.
                </p>
                <p>
                  Les cookies peuvent être des "cookies persistants" ou des "cookies de session". Les cookies persistants restent sur votre appareil pendant une période définie dans le cookie, et sont activés chaque fois que vous visitez le site web qui a créé ce cookie. Les cookies de session sont temporaires et expirent lorsque vous fermez votre navigateur.
                </p>
                
                <h2>3. Comment utilisons-nous les cookies ?</h2>
                <p>
                  Drive Deal utilise différents types de cookies pour les finalités suivantes :
                </p>
                
                <h3>3.1 Cookies strictement nécessaires</h3>
                <p>
                  Ces cookies sont essentiels au fonctionnement de notre site web et vous permettent de naviguer et d'utiliser ses fonctionnalités. Sans ces cookies, nous ne pourrions pas fournir les services que vous avez demandés, comme la mémorisation de vos informations de connexion ou les articles dans votre panier.
                </p>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-left">Nom du cookie</th>
                      <th className="border p-2 text-left">Finalité</th>
                      <th className="border p-2 text-left">Durée</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">session_id</td>
                      <td className="border p-2">Gère votre session utilisateur</td>
                      <td className="border p-2">Session</td>
                    </tr>
                    <tr>
                      <td className="border p-2">auth_token</td>
                      <td className="border p-2">Authentifie votre compte utilisateur</td>
                      <td className="border p-2">30 jours</td>
                    </tr>
                  </tbody>
                </table>
                
                <h3>3.2 Cookies de préférences</h3>
                <p>
                  Ces cookies nous permettent de mémoriser vos choix et de personnaliser notre site web en conséquence. Par exemple, nous pouvons mémoriser votre localisation pour vous montrer des véhicules disponibles près de chez vous, ou mémoriser vos préférences de recherche.
                </p>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-left">Nom du cookie</th>
                      <th className="border p-2 text-left">Finalité</th>
                      <th className="border p-2 text-left">Durée</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">user_preferences</td>
                      <td className="border p-2">Stocke vos préférences de recherche</td>
                      <td className="border p-2">90 jours</td>
                    </tr>
                    <tr>
                      <td className="border p-2">dark_mode</td>
                      <td className="border p-2">Mémorise votre préférence de thème (clair/sombre)</td>
                      <td className="border p-2">1 an</td>
                    </tr>
                  </tbody>
                </table>
                
                <h3>3.3 Cookies analytiques</h3>
                <p>
                  Ces cookies nous permettent de compter les visites et les sources de trafic afin que nous puissions mesurer et améliorer les performances de notre site. Ils nous aident à savoir quelles pages sont les plus et les moins populaires et à voir comment les visiteurs se déplacent sur le site.
                </p>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-left">Nom du cookie</th>
                      <th className="border p-2 text-left">Finalité</th>
                      <th className="border p-2 text-left">Durée</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">_ga</td>
                      <td className="border p-2">Google Analytics - Distingue les utilisateurs</td>
                      <td className="border p-2">2 ans</td>
                    </tr>
                    <tr>
                      <td className="border p-2">_gid</td>
                      <td className="border p-2">Google Analytics - Distingue les utilisateurs</td>
                      <td className="border p-2">24 heures</td>
                    </tr>
                    <tr>
                      <td className="border p-2">_gat</td>
                      <td className="border p-2">Google Analytics - Limite le taux de demandes</td>
                      <td className="border p-2">1 minute</td>
                    </tr>
                  </tbody>
                </table>
                
                <h3>3.4 Cookies de marketing</h3>
                <p>
                  Ces cookies sont utilisés pour suivre les visiteurs sur les sites web. L'intention est d'afficher des publicités qui sont pertinentes et engageantes pour l'utilisateur individuel et donc plus précieuses pour les éditeurs et les annonceurs tiers.
                </p>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-left">Nom du cookie</th>
                      <th className="border p-2 text-left">Finalité</th>
                      <th className="border p-2 text-left">Durée</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">_fbp</td>
                      <td className="border p-2">Facebook Pixel - Suivi des conversions</td>
                      <td className="border p-2">90 jours</td>
                    </tr>
                    <tr>
                      <td className="border p-2">ads_prefs</td>
                      <td className="border p-2">Stocke vos préférences publicitaires</td>
                      <td className="border p-2">180 jours</td>
                    </tr>
                  </tbody>
                </table>
                
                <h2>4. Cookies tiers</h2>
                <p>
                  En plus de nos propres cookies, nous pouvons également utiliser divers cookies tiers pour signaler les statistiques d'utilisation du site, diffuser des publicités et ainsi de suite. Ces cookies peuvent inclure :
                </p>
                <ul>
                  <li>Google Analytics</li>
                  <li>Google Ads</li>
                  <li>Facebook Pixel</li>
                  <li>Hotjar</li>
                </ul>
                
                <h2>5. Comment gérer les cookies</h2>
                <p>
                  La plupart des navigateurs web vous permettent de contrôler les cookies via les paramètres de votre navigateur. Voici comment accéder aux paramètres des cookies dans les navigateurs les plus populaires :
                </p>
                <ul>
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
                  <li><a href="https://support.mozilla.org/fr/kb/activer-desactiver-cookies" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
                  <li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
                  <li><a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
                </ul>
                <p>
                  Veuillez noter que la restriction des cookies peut vous empêcher d'utiliser certaines fonctionnalités de notre site web.
                </p>
                
                <h2>6. Modifications de notre politique de cookies</h2>
                <p>
                  Nous pouvons mettre à jour cette politique de cookies de temps à autre pour refléter, par exemple, les changements apportés aux cookies que nous utilisons ou pour d'autres raisons opérationnelles, légales ou réglementaires. Veuillez donc consulter régulièrement cette politique pour rester informé de notre utilisation des cookies et des technologies connexes.
                </p>
                <p>
                  La date en haut de cette politique indique quand elle a été mise à jour pour la dernière fois.
                </p>
                
                <h2>7. Nous contacter</h2>
                <p>
                  Si vous avez des questions concernant notre utilisation des cookies, veuillez nous contacter à :
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
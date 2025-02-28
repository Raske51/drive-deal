import React from 'react';
import Head from 'next/head';
import { useTheme } from '../hooks/useTheme';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Terms() {
  const { darkMode } = useTheme();
  
  return (
    <>
      <Head>
        <title>Conditions d'utilisation | Drive Deal</title>
        <meta name="description" content="Consultez les conditions d'utilisation de Drive Deal pour comprendre les règles et modalités d'utilisation de notre plateforme." />
      </Head>
      
      <div className={darkMode ? 'dark' : ''}>
        <Header />
        
        <main className="pt-20">
          {/* Section Hero */}
          <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fadeIn">Conditions d'utilisation</h1>
                <p className="text-xl text-gray-300 mb-8 animate-slideUp">
                  Veuillez lire attentivement ces conditions avant d'utiliser notre plateforme.
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
                
                <h2>1. Acceptation des conditions</h2>
                <p>
                  En accédant ou en utilisant le site web, les applications mobiles et les services de Drive Deal (collectivement, les "Services"), vous acceptez d'être lié par ces Conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos Services.
                </p>
                
                <h2>2. Modification des conditions</h2>
                <p>
                  Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet dès leur publication sur notre site. Il est de votre responsabilité de consulter régulièrement ces conditions. Votre utilisation continue des Services après la publication des modifications constitue votre acceptation de ces modifications.
                </p>
                
                <h2>3. Utilisation des Services</h2>
                <h3>3.1 Éligibilité</h3>
                <p>
                  Pour utiliser nos Services, vous devez avoir au moins 18 ans et être capable de conclure un contrat juridiquement contraignant. Si vous utilisez nos Services au nom d'une entreprise, vous déclarez avoir l'autorité pour engager cette entreprise.
                </p>
                
                <h3>3.2 Création de compte</h3>
                <p>
                  Certains de nos Services nécessitent la création d'un compte. Vous êtes responsable de maintenir la confidentialité de vos informations de connexion et de toutes les activités qui se produisent sous votre compte. Vous acceptez de nous informer immédiatement de toute utilisation non autorisée de votre compte.
                </p>
                
                <h3>3.3 Utilisation acceptable</h3>
                <p>
                  Vous acceptez d'utiliser nos Services uniquement à des fins légales et conformément à ces conditions. Vous ne devez pas :
                </p>
                <ul>
                  <li>Utiliser nos Services d'une manière qui pourrait désactiver, surcharger ou altérer nos Services</li>
                  <li>Utiliser des robots, des scrapers ou d'autres moyens automatisés pour accéder à nos Services</li>
                  <li>Contourner les mesures que nous pouvons utiliser pour empêcher ou restreindre l'accès à nos Services</li>
                  <li>Publier des informations fausses, trompeuses ou frauduleuses</li>
                  <li>Violer les droits de propriété intellectuelle ou autres droits de tiers</li>
                </ul>
                
                <h2>4. Contenu</h2>
                <h3>4.1 Contenu de l'utilisateur</h3>
                <p>
                  Lorsque vous soumettez, téléchargez, publiez ou partagez du contenu sur nos Services, vous nous accordez une licence mondiale, non exclusive, libre de redevance, transférable et pouvant faire l'objet d'une sous-licence pour utiliser, reproduire, modifier, adapter, publier, traduire, distribuer et afficher ce contenu dans le cadre de nos Services.
                </p>
                
                <h3>4.2 Contenu interdit</h3>
                <p>
                  Vous ne devez pas soumettre, télécharger, publier ou partager du contenu qui :
                </p>
                <ul>
                  <li>Est illégal, diffamatoire, obscène, pornographique, harcelant, menaçant ou invasif de la vie privée</li>
                  <li>Enfreint les droits de propriété intellectuelle ou autres droits de tiers</li>
                  <li>Contient des virus, des chevaux de Troie, des vers, des bombes logiques ou d'autres matériels malveillants</li>
                  <li>Pourrait inciter à la haine ou à la discrimination</li>
                </ul>
                
                <h2>5. Transactions</h2>
                <h3>5.1 Achat et vente de véhicules</h3>
                <p>
                  Drive Deal facilite les transactions entre acheteurs et vendeurs de véhicules. Nous ne sommes pas partie à ces transactions et n'assumons aucune responsabilité pour les actions ou omissions des utilisateurs.
                </p>
                
                <h3>5.2 Frais et paiements</h3>
                <p>
                  L'utilisation de certains Services peut être soumise à des frais. Tous les frais sont indiqués en euros et incluent la TVA applicable. Les paiements sont traités par des prestataires de services de paiement tiers, et vous acceptez leurs conditions d'utilisation.
                </p>
                
                <h3>5.3 Annulations et remboursements</h3>
                <p>
                  Les politiques d'annulation et de remboursement varient selon les services. Veuillez consulter les conditions spécifiques à chaque service pour plus d'informations.
                </p>
                
                <h2>6. Propriété intellectuelle</h2>
                <p>
                  Tous les droits de propriété intellectuelle sur nos Services et leur contenu (à l'exception du contenu fourni par les utilisateurs) appartiennent à Drive Deal ou à nos concédants de licence. Vous ne pouvez pas utiliser, reproduire, modifier, adapter, publier, traduire, distribuer ou afficher ce contenu sans notre autorisation écrite préalable.
                </p>
                
                <h2>7. Limitation de responsabilité</h2>
                <p>
                  Dans toute la mesure permise par la loi applicable, Drive Deal ne sera pas responsable des dommages indirects, accessoires, spéciaux, consécutifs ou punitifs, ou de toute perte de profits ou de revenus, que ces dommages soient prévisibles ou non, et même si Drive Deal a été informé de la possibilité de tels dommages.
                </p>
                
                <h2>8. Indemnisation</h2>
                <p>
                  Vous acceptez d'indemniser, de défendre et de dégager de toute responsabilité Drive Deal, ses dirigeants, administrateurs, employés et agents contre toutes réclamations, responsabilités, dommages, pertes et dépenses, y compris, sans limitation, les frais juridiques et comptables, découlant de ou liés à votre violation de ces conditions ou de votre utilisation de nos Services.
                </p>
                
                <h2>9. Résiliation</h2>
                <p>
                  Nous pouvons résilier ou suspendre votre accès à nos Services immédiatement, sans préavis ni responsabilité, pour quelque raison que ce soit, y compris, sans limitation, si vous enfreignez ces conditions. Après la résiliation, votre droit d'utiliser nos Services cessera immédiatement.
                </p>
                
                <h2>10. Droit applicable et juridiction</h2>
                <p>
                  Ces conditions sont régies par le droit français. Tout litige découlant de ou lié à ces conditions sera soumis à la juridiction exclusive des tribunaux de Paris, France.
                </p>
                
                <h2>11. Dispositions diverses</h2>
                <p>
                  Si une disposition de ces conditions est jugée invalide ou inapplicable, cette disposition sera limitée ou éliminée dans la mesure minimale nécessaire, et les autres dispositions de ces conditions resteront pleinement en vigueur.
                </p>
                <p>
                  Notre manquement à faire valoir un droit ou une disposition de ces conditions ne constitue pas une renonciation à ce droit ou à cette disposition.
                </p>
                
                <h2>12. Nous contacter</h2>
                <p>
                  Si vous avez des questions concernant ces conditions, veuillez nous contacter à :
                </p>
                <p>
                  Drive Deal<br />
                  123 Avenue des Champs-Élysées<br />
                  75008 Paris, France<br />
                  Email : legal@drivedeal.fr<br />
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
import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight, Check } from 'lucide-react';
import Button from './UI/Button';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      // Ici, vous pourriez ajouter une logique pour envoyer l'email à votre API
      setTimeout(() => {
        setSubscribed(false);
      }, 5000);
    }
  };

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      {/* Vague décorative en haut */}
      <div className="absolute -mt-16 left-0 right-0 h-16 z-10 transform rotate-180">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-full">
          <path 
            fill="#111827" 
            fillOpacity="1" 
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Section Newsletter */}
      <div className="container mx-auto px-4 mb-16">
        <div className="bg-primary/10 backdrop-blur-sm rounded-xl p-8 border border-primary/20 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="animate-slideRight">
              <h3 className="text-2xl font-bold mb-2">Restez informé</h3>
              <p className="text-gray-300">
                Inscrivez-vous à notre newsletter pour recevoir nos dernières offres et actualités automobiles.
              </p>
            </div>
            <div className="animate-slideLeft">
              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse email"
                    className="flex-grow px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <Button 
                    type="submit" 
                    variant="primary"
                    icon={<ArrowRight className="w-5 h-5" />}
                    iconPosition="right"
                  >
                    S'inscrire
                  </Button>
                </form>
              ) : (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-center text-green-400">
                  <Check className="w-5 h-5 mr-2" />
                  Merci pour votre inscription !
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* À propos */}
          <div className="animate-fadeIn">
            <h3 className="text-xl font-bold mb-4 text-primary">Drive Deal</h3>
            <p className="text-gray-400 mb-4">
              Votre plateforme premium pour l'achat et la vente de véhicules d'exception. 
              Nous connectons les passionnés d'automobiles avec les meilleures offres du marché.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors hover-lift">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors hover-lift">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors hover-lift">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors hover-lift">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-xl font-bold mb-4 text-primary">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/vehicles" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  Véhicules
                </Link>
              </li>
              <li>
                <Link href="/sell" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  Vendre
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-xl font-bold mb-4 text-primary">Nos services</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 hover:text-white transition-colors">Achat de véhicules</li>
              <li className="text-gray-400 hover:text-white transition-colors">Vente de véhicules</li>
              <li className="text-gray-400 hover:text-white transition-colors">Évaluation gratuite</li>
              <li className="text-gray-400 hover:text-white transition-colors">Financement</li>
              <li className="text-gray-400 hover:text-white transition-colors">Garantie</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-xl font-bold mb-4 text-primary">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start group">
                <MapPin className="mr-2 h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                <span className="text-gray-400 group-hover:text-white transition-colors">123 Avenue des Champs-Élysées, 75008 Paris</span>
              </li>
              <li className="flex items-center group">
                <Phone className="mr-2 h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                <span className="text-gray-400 group-hover:text-white transition-colors">+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center group">
                <Mail className="mr-2 h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                <span className="text-gray-400 group-hover:text-white transition-colors">contact@drivedeal.fr</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400">
          <p>© {currentYear} Drive Deal. Tous droits réservés.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Politique de confidentialité</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Conditions d'utilisation</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
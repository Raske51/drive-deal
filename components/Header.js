import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import Button from './UI/Button';
import { Menu, X, Sun, Moon, User, LogOut, Car, Home, Settings, Search, Heart, Bell, Mail } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();

  // Détecter le défilement pour changer l'apparence du header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [router.pathname]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md ${
        isScrolled 
          ? 'bg-white/90 dark:bg-gray-900/95 shadow-lg py-2' 
          : 'bg-transparent dark:bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-105">
              DriveDeal
            </span>
            <span className="ml-2 text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full hidden sm:inline-block transition-all duration-300 group-hover:bg-primary/20">
              PREMIUM
            </span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              href="/" 
              className={`px-4 py-2 rounded-full transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 ${
                router.pathname === '/' ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Accueil
            </Link>
            <Link 
              href="/listings" 
              className={`px-4 py-2 rounded-full transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 ${
                router.pathname === '/listings' ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Véhicules
            </Link>
            <Link 
              href="/about" 
              className={`px-4 py-2 rounded-full transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 ${
                router.pathname === '/about' ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              À propos
            </Link>
            <Link 
              href="/contact" 
              className={`px-4 py-2 rounded-full transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 ${
                router.pathname === '/contact' ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Contact
            </Link>
            <Link 
              href="/sell" 
              className="ml-2 px-5 py-2 bg-gradient-to-r from-secondary to-primary text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
            >
              Vendre un véhicule
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Recherche rapide - Desktop */}
            <button className="hidden md:flex items-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-300 hover:scale-110">
              <Search className="w-5 h-5" />
            </button>
            
            {/* Bouton thème */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-300 hover:scale-110"
              aria-label={darkMode ? 'Passer au mode clair' : 'Passer au mode sombre'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Authentification */}
            {user ? (
              <div className="relative">
                <div className="flex items-center space-x-2">
                  {/* Favoris - Desktop */}
                  <button className="hidden md:flex p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-300 hover:scale-110">
                    <Heart className="w-5 h-5" />
                  </button>
                  
                  {/* Notifications - Desktop */}
                  <button className="hidden md:flex p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 relative transition-all duration-300 hover:scale-110">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  
                  {/* Profil */}
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    <span className="font-medium text-sm hidden lg:block text-gray-700 dark:text-gray-300 pr-1">{user.name}</span>
                  </button>
                </div>
                
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl py-2 z-50 border border-gray-100 dark:border-gray-800 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/dashboard" className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-300 hover:pl-5">
                        <Car className="w-4 h-4 mr-3 text-gray-500" />
                        Mes véhicules
                      </Link>
                      <Link href="/favorites" className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-300 hover:pl-5">
                        <Heart className="w-4 h-4 mr-3 text-gray-500" />
                        Favoris
                      </Link>
                      <Link href="/settings" className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-300 hover:pl-5">
                        <Settings className="w-4 h-4 mr-3 text-gray-500" />
                        Paramètres
                      </Link>
                    </div>
                    <div className="py-1 border-t border-gray-100 dark:border-gray-800">
                      <button 
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 w-full text-left transition-all duration-300 hover:pl-5"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="hidden sm:block">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105"
                  >
                    Connexion
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md"
                  >
                    Inscription
                  </Button>
                </Link>
                <Link 
                  href="/sell" 
                  className="hidden sm:flex ml-1 px-4 py-2 bg-gradient-to-r from-secondary to-primary text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                >
                  Vendre
                </Link>
              </div>
            )}

            {/* Menu Mobile */}
            <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 md:hidden transition-all duration-300 hover:scale-110"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Mobile */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white dark:bg-gray-900 pt-20 animate-fadeIn">
          <nav className="h-full overflow-y-auto px-6 py-8">
            <div className="flex flex-col space-y-6">
              <Link 
                href="/" 
                className={`flex items-center py-3 px-4 rounded-xl transition-all duration-300 ${
                  router.pathname === '/' 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:translate-x-1'
                }`}
              >
                <Home className="w-5 h-5 mr-3" />
                Accueil
              </Link>
              <Link 
                href="/listings" 
                className={`flex items-center py-3 px-4 rounded-xl transition-all duration-300 ${
                  router.pathname === '/listings' 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:translate-x-1'
                }`}
              >
                <Car className="w-5 h-5 mr-3" />
                Véhicules
              </Link>
              <Link 
                href="/about" 
                className={`flex items-center py-3 px-4 rounded-xl transition-all duration-300 ${
                  router.pathname === '/about' 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:translate-x-1'
                }`}
              >
                <User className="w-5 h-5 mr-3" />
                À propos
              </Link>
              <Link 
                href="/contact" 
                className={`flex items-center py-3 px-4 rounded-xl transition-all duration-300 ${
                  router.pathname === '/contact' 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:translate-x-1'
                }`}
              >
                <Mail className="w-5 h-5 mr-3" />
                Contact
              </Link>
              <Link 
                href="/sell" 
                className="flex items-center py-3 px-4 rounded-xl bg-gradient-to-r from-secondary to-primary text-white font-medium shadow-md transition-all duration-300 hover:shadow-lg hover:translate-x-1"
              >
                <Car className="w-5 h-5 mr-3" />
                Vendre un véhicule
              </Link>
              
              <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                {user ? (
                  <>
                    <div className="flex items-center mb-6 px-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mr-4">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <Link 
                      href="/dashboard" 
                      className="flex items-center py-3 px-4 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:translate-x-1"
                    >
                      <Car className="w-5 h-5 mr-3" />
                      Mes véhicules
                    </Link>
                    <Link 
                      href="/favorites" 
                      className="flex items-center py-3 px-4 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:translate-x-1"
                    >
                      <Heart className="w-5 h-5 mr-3" />
                      Favoris
                    </Link>
                    <Link 
                      href="/settings" 
                      className="flex items-center py-3 px-4 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:translate-x-1"
                    >
                      <Settings className="w-5 h-5 mr-3" />
                      Paramètres
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center py-3 px-4 rounded-xl text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 w-full text-left mt-4 transition-all duration-300 hover:translate-x-1"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <div className="space-y-3 px-4">
                    <Link href="/login">
                      <Button variant="outline" fullWidth className="transition-all duration-300 hover:scale-[1.02]">
                        Connexion
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="primary" fullWidth className="transition-all duration-300 hover:scale-[1.02]">
                        Inscription
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
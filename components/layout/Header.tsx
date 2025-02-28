import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">Drive Deal</span>
          </Link>

          {/* Navigation principale - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/search" className={`nav-link ${router.pathname === '/search' ? 'text-blue-600' : 'text-gray-600'}`}>
              Rechercher
            </Link>
            <Link href="/favorites" className={`nav-link ${router.pathname === '/favorites' ? 'text-blue-600' : 'text-gray-600'}`}>
              Favoris
            </Link>
            <Link href="/alerts" className={`nav-link ${router.pathname === '/alerts' ? 'text-blue-600' : 'text-gray-600'}`}>
              Alertes
            </Link>
          </div>

          {/* Menu utilisateur - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                  <span>{user.name}</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profil
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-x-4">
                <Link href="/login" className="text-gray-600 hover:text-blue-600">
                  Connexion
                </Link>
                <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Bouton menu mobile */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <Link href="/search" className="text-gray-600 hover:text-blue-600">
                Rechercher
              </Link>
              <Link href="/favorites" className="text-gray-600 hover:text-blue-600">
                Favoris
              </Link>
              <Link href="/alerts" className="text-gray-600 hover:text-blue-600">
                Alertes
              </Link>
              {user ? (
                <>
                  <Link href="/profile" className="text-gray-600 hover:text-blue-600">
                    Profil
                  </Link>
                  <button
                    onClick={logout}
                    className="text-left text-gray-600 hover:text-blue-600"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-blue-600">
                    Connexion
                  </Link>
                  <Link href="/register" className="text-gray-600 hover:text-blue-600">
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
} 
import { useState, useEffect, createContext, useContext } from 'react';

// Création d'un contexte pour l'authentification
const AuthContext = createContext();

// Provider qui enveloppera l'application
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler la vérification de l'authentification
    const checkAuth = async () => {
      try {
        // Dans une application réelle, vous feriez une requête API ici
        // pour vérifier si l'utilisateur est connecté
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    // Simuler une connexion
    // Dans une application réelle, vous feriez une requête API ici
    const mockUser = { id: 1, name: 'Utilisateur Test', email };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    return mockUser;
  };

  // Fonction de déconnexion
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  return useContext(AuthContext);
}

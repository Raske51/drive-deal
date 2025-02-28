import React, { useState } from 'react';
import { Search, X, Sliders } from 'lucide-react';
import { useRouter } from 'next/router';

/**
 * Composant de barre de recherche amélioré avec un meilleur contraste et une meilleure visibilité
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.className - Classes CSS additionnelles
 * @param {string} props.variant - Variante de la barre de recherche ('default' ou 'compact')
 * @param {Object} props.initialValues - Valeurs initiales pour les champs de recherche
 */
export default function EnhancedSearchBar({ 
  className = '', 
  variant = 'default',
  initialValues = {}
}) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchParams, setSearchParams] = useState({
    query: initialValues.query || '',
    brand: initialValues.brand || '',
    model: initialValues.model || '',
    minPrice: initialValues.minPrice || '',
    maxPrice: initialValues.maxPrice || '',
    minYear: initialValues.minYear || '',
    maxYear: initialValues.maxYear || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construire l'URL de recherche
    const params = new URLSearchParams();
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
    
    router.push(`/listings?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchParams({
      query: '',
      brand: '',
      model: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: ''
    });
  };

  return (
    <div className={`enhanced-search-bar ${className} ${variant === 'compact' ? 'compact' : ''}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="search-input-container">
          <div className="search-icon">
            <Search size={20} />
          </div>
          
          <input
            type="text"
            name="query"
            value={searchParams.query}
            onChange={handleChange}
            placeholder="Rechercher une voiture..."
            className="search-input"
            aria-label="Rechercher une voiture"
          />
          
          {searchParams.query && (
            <button 
              type="button" 
              onClick={clearSearch}
              className="clear-button"
              aria-label="Effacer la recherche"
            >
              <X size={18} />
            </button>
          )}
          
          <button 
            type="button" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="filter-button"
            aria-label="Filtres avancés"
            aria-expanded={isExpanded}
          >
            <Sliders size={18} />
            <span>Filtres</span>
          </button>
          
          <button type="submit" className="submit-button">
            Rechercher
          </button>
        </div>
        
        {isExpanded && (
          <div className="advanced-filters">
            <div className="filters-grid">
              <div className="filter-group">
                <label htmlFor="brand">Marque</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={searchParams.brand}
                  onChange={handleChange}
                  placeholder="Toutes les marques"
                />
              </div>
              
              <div className="filter-group">
                <label htmlFor="model">Modèle</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={searchParams.model}
                  onChange={handleChange}
                  placeholder="Tous les modèles"
                />
              </div>
              
              <div className="filter-group">
                <label htmlFor="minPrice">Prix min</label>
                <input
                  type="number"
                  id="minPrice"
                  name="minPrice"
                  value={searchParams.minPrice}
                  onChange={handleChange}
                  placeholder="0 €"
                  min="0"
                />
              </div>
              
              <div className="filter-group">
                <label htmlFor="maxPrice">Prix max</label>
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  value={searchParams.maxPrice}
                  onChange={handleChange}
                  placeholder="Pas de max"
                  min="0"
                />
              </div>
              
              <div className="filter-group">
                <label htmlFor="minYear">Année min</label>
                <input
                  type="number"
                  id="minYear"
                  name="minYear"
                  value={searchParams.minYear}
                  onChange={handleChange}
                  placeholder="Toutes"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              
              <div className="filter-group">
                <label htmlFor="maxYear">Année max</label>
                <input
                  type="number"
                  id="maxYear"
                  name="maxYear"
                  value={searchParams.maxYear}
                  onChange={handleChange}
                  placeholder="Toutes"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
            
            <div className="filter-actions">
              <button type="button" onClick={clearSearch} className="reset-button">
                Réinitialiser
              </button>
              <button type="submit" className="apply-button">
                Appliquer les filtres
              </button>
            </div>
          </div>
        )}
      </form>
      
      <style jsx>{`
        .enhanced-search-bar {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .search-input-container {
          display: flex;
          align-items: center;
          background: white;
          border-radius: 12px;
          padding: 6px 6px 6px 16px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease-in-out;
          border: 2px solid transparent;
        }
        
        .search-input-container:focus-within {
          box-shadow: 0px 6px 14px rgba(0, 0, 0, 0.2);
          border-color: #ff5c00;
        }
        
        .search-icon {
          color: #777;
          margin-right: 10px;
        }
        
        .search-input {
          flex: 1;
          border: none;
          font-size: 1rem;
          padding: 12px 0;
          background: transparent;
          color: #333;
        }
        
        .search-input:focus {
          outline: none;
        }
        
        .clear-button {
          background: #f0f0f0;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
          color: #777;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .clear-button:hover {
          background: #e0e0e0;
          color: #333;
        }
        
        .filter-button {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f0f0f0;
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          color: #555;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-right: 8px;
        }
        
        .filter-button:hover {
          background: #e0e0e0;
          color: #333;
        }
        
        .submit-button {
          background: #ff5c00;
          color: white;
          font-weight: bold;
          border: none;
          border-radius: 8px;
          padding: 12px 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .submit-button:hover {
          background: #e04a00;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .advanced-filters {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-top: 10px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
          animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
        }
        
        .filter-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #555;
          margin-bottom: 6px;
        }
        
        .filter-group input {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }
        
        .filter-group input:focus {
          border-color: #ff5c00;
          box-shadow: 0 0 0 3px rgba(255, 92, 0, 0.2);
          outline: none;
        }
        
        .filter-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
        }
        
        .reset-button {
          background: #f0f0f0;
          color: #555;
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .reset-button:hover {
          background: #e0e0e0;
          color: #333;
        }
        
        .apply-button {
          background: #ff5c00;
          color: white;
          font-weight: bold;
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .apply-button:hover {
          background: #e04a00;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        /* Variante compacte */
        .compact .search-input-container {
          padding: 4px 4px 4px 12px;
        }
        
        .compact .search-input {
          padding: 8px 0;
          font-size: 0.875rem;
        }
        
        .compact .submit-button {
          padding: 8px 16px;
          font-size: 0.875rem;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .filters-grid {
            grid-template-columns: 1fr;
          }
          
          .filter-actions {
            flex-direction: column;
          }
          
          .reset-button, .apply-button {
            width: 100%;
          }
        }
        
        /* Mode sombre */
        @media (prefers-color-scheme: dark) {
          .search-input-container {
            background: #1e1e1e;
            border-color: #333;
          }
          
          .search-input {
            color: #f0f0f0;
          }
          
          .search-icon {
            color: #aaa;
          }
          
          .clear-button {
            background: #333;
            color: #aaa;
          }
          
          .clear-button:hover {
            background: #444;
            color: #f0f0f0;
          }
          
          .filter-button {
            background: #333;
            color: #aaa;
          }
          
          .filter-button:hover {
            background: #444;
            color: #f0f0f0;
          }
          
          .advanced-filters {
            background: #1e1e1e;
          }
          
          .filter-group label {
            color: #ccc;
          }
          
          .filter-group input {
            background: #2a2a2a;
            border-color: #444;
            color: #f0f0f0;
          }
          
          .reset-button {
            background: #333;
            color: #ccc;
          }
          
          .reset-button:hover {
            background: #444;
            color: #f0f0f0;
          }
        }
      `}</style>
    </div>
  );
} 
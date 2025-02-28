import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  CenteredLayout, 
  CenteredText, 
  CenteredButtons 
} from '../components/CenteredLayout';

/**
 * AlignmentDemo - Page de démonstration interactive pour tester les différentes techniques de centrage
 * Cette page permet aux développeurs de visualiser et comprendre comment fonctionnent les différentes
 * méthodes de centrage dans différents contextes.
 */
const AlignmentDemo = () => {
  // État pour les options de démonstration
  const [method, setMethod] = useState('flex');
  const [vertical, setVertical] = useState(true);
  const [width, setWidth] = useState('md');
  const [height, setHeight] = useState('300px');
  const [bgColor, setBgColor] = useState('#f3f4f6');
  const [contentBgColor, setContentBgColor] = useState('#ffffff');
  const [contentWidth, setContentWidth] = useState('200px');
  const [contentHeight, setContentHeight] = useState('100px');

  // Générer les classes CSS en fonction des options sélectionnées
  const getContainerClasses = () => {
    let classes = '';
    
    if (method === 'flex') {
      classes = 'display: flex;';
      classes += ' justify-content: center;';
      if (vertical) {
        classes += ' align-items: center;';
      }
    } else if (method === 'grid') {
      classes = 'display: grid;';
      if (vertical) {
        classes += ' place-items: center;';
      } else {
        classes += ' justify-items: center;';
      }
    } else if (method === 'margin') {
      classes = '';
    }
    
    return classes;
  };

  const getContentClasses = () => {
    let classes = '';
    
    if (method === 'margin') {
      classes = 'margin-left: auto; margin-right: auto;';
      if (vertical) {
        classes += ' margin-top: auto; margin-bottom: auto;';
      }
    }
    
    return classes;
  };

  // Code CSS généré pour l'exemple
  const generatedCSS = `
.container {
  ${getContainerClasses()}
  width: 100%;
  height: ${height};
  background-color: ${bgColor};
}

.content {
  ${getContentClasses()}
  width: ${contentWidth};
  height: ${contentHeight};
  background-color: ${contentBgColor};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
`;

  return (
    <>
      <Head>
        <title>Démo d'Alignement | DriveDeal</title>
        <meta name="description" content="Démonstration des techniques de centrage pour DriveDeal" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 text-white py-4">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">DriveDeal - Démo d'Alignement</h1>
              <Link href="/" className="text-white hover:underline">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <CenteredText className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Démonstration des Techniques de Centrage</h1>
            <p className="text-gray-600">
              Utilisez les contrôles ci-dessous pour tester différentes méthodes de centrage et voir leur effet en temps réel.
            </p>
          </CenteredText>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Panneau de contrôle */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Contrôles</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Méthode de centrage</label>
                  <select 
                    value={method} 
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="flex">Flexbox</option>
                    <option value="grid">Grid</option>
                    <option value="margin">Marges automatiques</option>
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={vertical} 
                      onChange={(e) => setVertical(e.target.checked)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Centrage vertical</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hauteur du conteneur</label>
                  <input 
                    type="text" 
                    value={height} 
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Couleur d'arrière-plan</label>
                  <input 
                    type="color" 
                    value={bgColor} 
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full p-1 border rounded h-10"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions du contenu</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      value={contentWidth} 
                      onChange={(e) => setContentWidth(e.target.value)}
                      className="p-2 border rounded"
                      placeholder="Largeur"
                    />
                    <input 
                      type="text" 
                      value={contentHeight} 
                      onChange={(e) => setContentHeight(e.target.value)}
                      className="p-2 border rounded"
                      placeholder="Hauteur"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Couleur du contenu</label>
                  <input 
                    type="color" 
                    value={contentBgColor} 
                    onChange={(e) => setContentBgColor(e.target.value)}
                    className="w-full p-1 border rounded h-10"
                  />
                </div>
              </div>
            </div>
            
            {/* Aperçu */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Aperçu</h2>
              
              <div 
                className="border rounded-lg overflow-hidden mb-6"
                style={{ 
                  height, 
                  backgroundColor: bgColor,
                  display: method === 'flex' ? 'flex' : method === 'grid' ? 'grid' : 'block',
                  justifyContent: (method === 'flex' && 'center') || undefined,
                  alignItems: (method === 'flex' && vertical && 'center') || undefined,
                  placeItems: (method === 'grid' && vertical && 'center') || undefined,
                  justifyItems: (method === 'grid' && !vertical && 'center') || undefined
                }}
              >
                <div 
                  className="flex justify-center items-center rounded-lg shadow-md"
                  style={{ 
                    width: contentWidth, 
                    height: contentHeight, 
                    backgroundColor: contentBgColor,
                    marginLeft: method === 'margin' ? 'auto' : undefined,
                    marginRight: method === 'margin' ? 'auto' : undefined,
                    marginTop: method === 'margin' && vertical ? 'auto' : undefined,
                    marginBottom: method === 'margin' && vertical ? 'auto' : undefined
                  }}
                >
                  <span className="text-sm font-medium">Contenu</span>
                </div>
              </div>
              
              {/* Code généré */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Code CSS généré</h3>
                <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto text-sm">
                  {generatedCSS}
                </pre>
              </div>
            </div>
          </div>
          
          {/* Exemples de cas d'utilisation */}
          <section className="mt-16">
            <CenteredText className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Cas d'utilisation courants</h2>
              <p className="text-gray-600">
                Voici quelques exemples pratiques de centrage pour différents éléments d'interface.
              </p>
            </CenteredText>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Exemple 1: Bouton centré */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Bouton centré</h3>
                <div className="border rounded-lg p-4 h-40 flex-center mb-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    Bouton centré
                  </button>
                </div>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 160px;
}`}
                </pre>
              </div>
              
              {/* Exemple 2: Carte centrée */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Carte centrée</h3>
                <div className="border rounded-lg p-4 h-40 grid-center mb-4">
                  <div className="bg-gray-100 p-3 rounded shadow-sm w-32 text-center">
                    Carte
                  </div>
                </div>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`.container {
  display: grid;
  place-items: center;
  height: 160px;
}`}
                </pre>
              </div>
              
              {/* Exemple 3: Texte centré */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Texte centré</h3>
                <div className="border rounded-lg p-4 h-40 mb-4">
                  <div className="h-full flex flex-col justify-center">
                    <p className="text-center">Ce texte est centré verticalement et horizontalement.</p>
                  </div>
                </div>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`.container {
  height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.text {
  text-align: center;
}`}
                </pre>
              </div>
            </div>
          </section>
          
          <CenteredButtons className="mt-12">
            <Link 
              href="/ALIGNMENT-GUIDE.md" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              target="_blank"
            >
              Consulter le guide complet d'alignement
            </Link>
          </CenteredButtons>
        </main>
        
        <footer className="bg-gray-800 text-white py-6 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p>© {new Date().getFullYear()} DriveDeal. Tous droits réservés.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default AlignmentDemo; 
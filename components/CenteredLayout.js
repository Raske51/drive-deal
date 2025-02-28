import React from 'react';

/**
 * Composant de mise en page centré
 * Ce composant permet de centrer parfaitement son contenu horizontalement et verticalement
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Le contenu à centrer
 * @param {string} props.className - Classes CSS additionnelles
 * @param {boolean} props.vertical - Si true, centre également verticalement (nécessite une hauteur définie)
 * @param {string} props.method - Méthode de centrage ('flex', 'grid', 'auto')
 * @param {string} props.width - Largeur maximale du contenu ('full', 'md', 'lg', 'xl')
 */
export default function CenteredLayout({ 
  children, 
  className = '', 
  vertical = false,
  method = 'flex',
  width = 'lg'
}) {
  // Déterminer les classes de centrage en fonction de la méthode
  let centerClass = '';
  
  switch (method) {
    case 'grid':
      centerClass = 'grid-center';
      break;
    case 'auto':
      centerClass = 'mx-auto';
      break;
    case 'flex':
    default:
      centerClass = vertical ? 'flex-center' : 'flex-center-horizontal';
      break;
  }
  
  // Déterminer la classe de largeur
  let widthClass = '';
  
  switch (width) {
    case 'full':
      widthClass = 'w-full';
      break;
    case 'md':
      widthClass = 'max-w-md';
      break;
    case 'lg':
      widthClass = 'max-w-lg';
      break;
    case 'xl':
      widthClass = 'max-w-xl';
      break;
    default:
      widthClass = 'max-w-lg';
      break;
  }
  
  return (
    <div className={`${centerClass} ${widthClass} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Composant pour centrer du texte
 */
export function CenteredText({ children, className = '' }) {
  return (
    <div className={`text-center ${className}`}>
      {children}
    </div>
  );
}

/**
 * Composant pour centrer une image
 */
export function CenteredImage({ src, alt, className = '', width, height }) {
  return (
    <div className="flex-center-horizontal">
      <img 
        src={src} 
        alt={alt} 
        className={`image-centered ${className}`}
        width={width}
        height={height}
      />
    </div>
  );
}

/**
 * Composant pour centrer un formulaire
 */
export function CenteredForm({ children, className = '', onSubmit }) {
  return (
    <form onSubmit={onSubmit} className={`form-centered ${className}`}>
      {children}
    </form>
  );
}

/**
 * Composant pour centrer des boutons
 */
export function CenteredButtons({ children, className = '' }) {
  return (
    <div className={`inline-center ${className}`}>
      {children}
    </div>
  );
}

/**
 * Composant pour centrer une section
 */
export function CenteredSection({ children, className = '' }) {
  return (
    <section className={`section-centered ${className}`}>
      {children}
    </section>
  );
}

/**
 * Composant pour centrer des cartes
 */
export function CenteredCards({ children, className = '' }) {
  return (
    <div className={`card-container ${className}`}>
      {children}
    </div>
  );
} 
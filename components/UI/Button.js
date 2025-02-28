import React from 'react';
import Link from 'next/link';

const Button = ({
  children,
  variant = 'default',
  size = 'md',
  icon = null,
  iconPosition = 'left',
  is3D = false,
  fullWidth = false,
  href = null,
  className = '',
  ...props
}) => {
  // Base classes communes à tous les boutons
  const baseClasses = `
    inline-flex items-center justify-center font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50
    disabled:opacity-60 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  // Classes spécifiques aux variantes
  const variantClasses = {
    default: 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    primary: `bg-primary hover:bg-primary-dark text-white ${is3D ? 'shadow-lg shadow-primary/30 hover:shadow-primary/40 transform hover:-translate-y-0.5 active:translate-y-0' : ''}`,
    secondary: 'bg-blue-500 hover:bg-blue-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    info: 'bg-cyan-500 hover:bg-cyan-600 text-white',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/5 dark:hover:bg-primary/10',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300',
  };

  // Classes spécifiques aux tailles
  const sizeClasses = {
    xs: 'text-xs px-2.5 py-1.5 rounded-lg gap-1.5',
    sm: 'text-sm px-3 py-2 rounded-lg gap-2',
    md: 'text-base px-4 py-2.5 rounded-xl gap-2',
    lg: 'text-lg px-5 py-3 rounded-xl gap-2.5',
    xl: 'text-xl px-6 py-3.5 rounded-2xl gap-3',
  };

  // Assembler toutes les classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.default}
    ${sizeClasses[size] || sizeClasses.md}
  `;

  // Contenu du bouton avec l'icône
  const buttonContent = (
    <>
      {icon && iconPosition === 'left' && (
        <span className="inline-flex shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {icon && iconPosition === 'right' && (
        <span className="inline-flex shrink-0">{icon}</span>
      )}
    </>
  );

  // Rendu conditionnel en fonction de la présence d'un href
  if (href) {
    return (
      <Link href={href} className={buttonClasses} {...props}>
        {buttonContent}
      </Link>
    );
  }

  return (
    <button className={buttonClasses} {...props}>
      {buttonContent}
    </button>
  );
};

export default Button;

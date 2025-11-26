import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  // Agressive, sharp, uppercase styling
  const baseStyle = "px-6 py-3 rounded-sm font-display font-bold uppercase tracking-wider text-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 border";
  
  const variants = {
    // Gradient metallic red/orange
    primary: "bg-gradient-to-r from-brand-700 to-brand-500 hover:from-brand-600 hover:to-brand-400 text-white border-transparent hover:shadow-glow shadow-md",
    // Dark metal look
    secondary: "bg-dark-700 hover:bg-dark-600 text-white border-dark-600 hover:border-brand-500/50",
    // Red danger
    danger: "bg-red-900/80 hover:bg-red-800 text-white border-red-800 hover:border-red-500",
    // Ghost
    ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white border-transparent"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed grayscale' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
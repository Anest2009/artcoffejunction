import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  const variantStyles = {
    primary: 'bg-gold-500 text-white hover:bg-gold-600 focus:ring-gold-500',
    secondary: 'bg-brown-500 text-white hover:bg-brown-600 focus:ring-brown-500',
    ghost: 'bg-transparent text-gold-500 hover:bg-gold-50/10 focus:ring-gold-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  };

  return (
    <button
      {...props}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {loading ? (
        <span className="animate-spin -ml-1 mr-2 border-2 border-white border-t-transparent h-4 w-4"></span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-semibold rounded-xl inline-flex items-center justify-center transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-500/15 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 focus:ring-indigo-500 active:translate-y-0',
    secondary: 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm focus:ring-slate-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-550/15 hover:-translate-y-0.5 focus:ring-red-500 active:translate-y-0',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 focus:ring-slate-350',
  };

  const sizes = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

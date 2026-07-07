import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardProps) {
  return (
    <div className={`px-6 py-4 border-b border-slate-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }: CardProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: CardProps) {
  return <h2 className={`text-lg font-semibold text-slate-900 ${className}`}>{children}</h2>;
}

export function CardDescription({ children, className = '' }: CardProps) {
  return (
    <p className={`text-sm text-slate-500 mt-1 ${className}`}>{children}</p>
  );
}

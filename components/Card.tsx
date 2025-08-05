
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-gray-900 p-4 rounded-lg border border-gray-800 shadow-md transition-all duration-300 hover:border-gray-700 hover:shadow-xl ${className}`}
    >
      {children}
    </div>
  );
};
import React from 'react';

interface MainContainerProps {
  children: React.ReactNode;
}

export function MainContainer({ children }: MainContainerProps) {
  // Puedes añadir clases de Tailwind o estilos según necesites
  return (
    <div className="container mx-auto p-4 space-y-6">
      {children}
    </div>
  );
} 
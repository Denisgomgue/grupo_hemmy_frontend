import React from 'react';

interface MainContainerProps {
  children: React.ReactNode;
}

export function MainContainer({ children }: MainContainerProps) {
  // Puedes añadir clases de Tailwind o estilos según necesites
  return (
    <div className="p-4 m-auto">
      {children}
    </div>
  );
} 
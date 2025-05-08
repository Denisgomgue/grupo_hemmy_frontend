import React from 'react';

interface HeaderActionsProps {
  title: string;
  children: React.ReactNode; // Para los botones
}

export function HeaderActions({ title, children }: HeaderActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h1>
      <div className="flex flex-shrink-0 gap-2">
        {children} {/* Renderiza los botones (AddButton, ReloadButton) */}
      </div>
    </div>
  );
} 
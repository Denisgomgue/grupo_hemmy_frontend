"use client";

import * as React from "react";
import { cn } from "@/lib/utils"; // Para combinar clases de Tailwind

interface InfoCardShellProps {
    topSection: React.ReactNode;     // Contenido para la sección superior (ej: avatar, título, acciones)
    middleSection: React.ReactNode; // Contenido para la sección de detalles principal
    bottomSection?: React.ReactNode; // Contenido opcional para la sección inferior (después del divisor)
    className?: string;            // Clases adicionales para el contenedor principal
}

export function InfoCardShell({
    topSection,
    middleSection,
    bottomSection,
    className
}: InfoCardShellProps) {
    return (
        <div className={cn(
            "p-4 border rounded-lg shadow-sm mb-4 bg-card text-card-foreground", // Estilos base
            className // Clases personalizadas
        )}>
            {/* Renderizar Sección Superior */}
            {topSection}

            {/* Renderizar Sección Media */}
            {middleSection}

            {/* Renderizar Sección Inferior (si existe) con divisor */}
            {bottomSection && (
                <div className="border-t pt-3 mt-4"> {/* Añadido mt-4 para separar del medio */}
                    {bottomSection}
                </div>
            )}
        </div>
    );
} 
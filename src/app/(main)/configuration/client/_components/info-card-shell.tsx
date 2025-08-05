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
            "p-6 border rounded-lg shadow-sm bg-card text-card-foreground flex flex-col h-full justify-between", // Estilos base y alineación
            className // Clases personalizadas
        )}>
            {/* Renderizar Sección Superior */}
            {topSection}

            {/* Renderizar Sección Media */}
            <div className="flex-1 flex flex-col justify-between">
                {middleSection}
                {/* Renderizar Sección Inferior (si existe) con divisor */}
                {bottomSection && (
                    <div className="border-t pt-3 mt-4"> {/* Añadido mt-4 para separar del medio */}
                        {bottomSection}
                    </div>
                )}
            </div>
        </div>
    );
} 
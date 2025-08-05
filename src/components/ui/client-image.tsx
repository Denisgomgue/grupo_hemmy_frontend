"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientImageProps {
    imagePath?: string | File | null;
    alt?: string;
    width?: number;
    height?: number;
    className?: string;
    fallbackClassName?: string;
    showFallbackIcon?: boolean;
    fallbackText?: string;
}

// Función auxiliar para construir la URL completa de la imagen
const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return '';

    // Si ya es una URL completa, devolverla tal como está
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Si es una ruta relativa, construir la URL completa con la API
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    return `${baseUrl}/${imagePath.replace(/^\//, '')}`;
};

export function ClientImage({
    imagePath,
    alt = "Imagen de Cliente",
    width = 150,
    height = 150,
    className = "",
    fallbackClassName = "",
    showFallbackIcon = true,
    fallbackText = "Sin imagen"
}: ClientImageProps) {
    const [ imageError, setImageError ] = useState(false);

    // Si no hay imagen o es un archivo, mostrar fallback
    if (!imagePath || typeof imagePath !== 'string' || imageError) {
        return (
            <div className={cn(
                "border rounded-lg flex items-center justify-center bg-gray-100",
                fallbackClassName
            )}>
                <div className="text-center">
                    {showFallbackIcon && (
                        <ImageIcon className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                    )}
                    <p className="text-xs text-gray-500">{fallbackText}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("relative border rounded-lg overflow-hidden", className)}>
            <Image
                src={getImageUrl(imagePath)}
                alt={alt}
                width={width}
                height={height}
                className="object-cover w-full h-full"
                onError={() => setImageError(true)}
            />
        </div>
    );
}

// Versión con fill para contenedores con dimensiones fijas
export function ClientImageFill({
    imagePath,
    alt = "Imagen de Cliente",
    className = "",
    fallbackClassName = "",
    showFallbackIcon = true,
    fallbackText = "Sin imagen",
    sizes = "250px"
}: Omit<ClientImageProps, 'width' | 'height'> & { sizes?: string }) {
    const [ imageError, setImageError ] = useState(false);

    // Si no hay imagen o es un archivo, mostrar fallback
    if (!imagePath || typeof imagePath !== 'string' || imageError) {
        return (
            <div className={cn(
                "border rounded-lg flex items-center justify-center bg-gray-100",
                fallbackClassName
            )}>
                <div className="text-center">
                    {showFallbackIcon && (
                        <ImageIcon className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                    )}
                    <p className="text-xs text-gray-500">{fallbackText}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("relative border rounded-lg overflow-hidden", className)}>
            <Image
                src={getImageUrl(imagePath)}
                alt={alt}
                fill
                className="object-contain"
                sizes={sizes}
                onError={() => setImageError(true)}
            />
        </div>
    );
} 
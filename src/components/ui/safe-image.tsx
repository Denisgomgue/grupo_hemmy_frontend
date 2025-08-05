import React from 'react';
import Image from 'next/image';

interface SafeImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    fallbackSrc?: string;
}

export function SafeImage({
    src,
    alt,
    width = 200,
    height = 200,
    className = "",
    fallbackSrc = "/placeholder-image.jpg"
}: SafeImageProps) {
    const [ imgSrc, setImgSrc ] = React.useState(src);
    const [ hasError, setHasError ] = React.useState(false);
    const [ isLoading, setIsLoading ] = React.useState(true);

    React.useEffect(() => {
        setImgSrc(src);
        setHasError(false);
        setIsLoading(true);
    }, [ src ]);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(fallbackSrc);
        }
        setIsLoading(false);
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    // Si la imagen es de localhost y hay error, usar img normal
    if (hasError && (src.includes('localhost') || src.includes('127.0.0.1'))) {
        return (
            <div className={`relative ${className}`} style={{ width, height }}>
                <img
                    src={fallbackSrc}
                    alt={alt}
                    width={width}
                    height={height}
                    className="object-cover w-full h-full"
                    onError={handleError}
                    onLoad={handleLoad}
                />
                {isLoading && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                        <div className="text-gray-500 text-sm">Cargando...</div>
                    </div>
                )}
            </div>
        );
    }

    // Si la URL es inválida o está vacía, mostrar placeholder
    if (!src || src === 'null' || src === 'undefined') {
        return (
            <div className={`relative ${className}`} style={{ width, height }}>
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <div className="text-gray-500 text-sm">Sin imagen</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`} style={{ width, height }}>
            <Image
                src={imgSrc}
                alt={alt}
                width={width}
                height={height}
                className="object-cover w-full h-full"
                onError={handleError}
                onLoad={handleLoad}
                unoptimized={src.includes('localhost') || src.includes('127.0.0.1')}
                priority={false}
            />
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="text-gray-500 text-sm">Cargando...</div>
                </div>
            )}
        </div>
    );
} 
"use client";

import { useState, PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function Providers({ children }: PropsWithChildren) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                staleTime: process.env.NODE_ENV === 'production' ? 5 * 60 * 1000 : 0, // 5 minutos en producción, 0 en desarrollo
                retry: process.env.NODE_ENV === 'production' ? 2 : 0, // 2 reintentos en producción, 0 en desarrollo
                gcTime: process.env.NODE_ENV === 'production' ? 10 * 60 * 1000 : 5 * 60 * 1000, // 10 minutos en producción
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
} 
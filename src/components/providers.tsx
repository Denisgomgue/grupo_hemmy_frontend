"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Crear una instancia del cliente. 
// Es importante que se cree solo una vez por renderizado del lado del cliente,
// por eso usamos useState para mantener la misma instancia.
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Configuración optimizada para producción
        staleTime: process.env.NODE_ENV === 'production' ? 5 * 60 * 1000 : 60 * 1000, // 5 minutos en producción, 1 minuto en desarrollo
        refetchOnWindowFocus: process.env.NODE_ENV === 'production' ? false : true,
        retry: process.env.NODE_ENV === 'production' ? 2 : 1,
        gcTime: process.env.NODE_ENV === 'production' ? 30 * 60 * 1000 : 10 * 60 * 1000, // 30 minutos en producción
        retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000), // Backoff exponencial con máximo 30 segundos
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: siempre crea una nueva instancia
    return makeQueryClient();
  } else {
    // Browser: usa la instancia existente o crea una nueva
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // NOTA: Para evitar que se cree una nueva instancia en cada renderizado,
  // usamos getQueryClient() que maneja la lógica singleton en el navegador.
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools solo visible en desarrollo */}
      {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
} 
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
        // Configuración global opcional para queries
        staleTime: 60 * 1000, // 1 minuto
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
      {/* Opcional: Añadir React Query DevTools para depuración */} 
      <ReactQueryDevtools initialIsOpen={false} /> 
    </QueryClientProvider>
  );
} 
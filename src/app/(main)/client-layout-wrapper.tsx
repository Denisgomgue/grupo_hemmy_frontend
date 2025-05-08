"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
// Restaurar imports relacionados con Auth/Permisos
import { useAuth } from "@/contexts/AuthContext";
import { AbilityContext } from "@/contexts/AbilityContext";
import { defineAbilitiesFor } from "@/lib/abilities"; // Asumimos que este archivo existe y exporta la función
import { Sidebar } from "@/components/sidebar/sidebar";
import { TopBar } from "@/components/sidebar/top-bar";
import { Spinner } from "@/components/ui/spinner"; // Restaurar si es necesario para el loading
import { useTheme } from "@/contexts/ThemeContext";

// Este componente ahora contiene la lógica de cliente y el layout visual
export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    // Restaurar hooks y estado relacionados con Auth/Permisos
    const { user, loading } = useAuth();
    const { layoutMode } = useTheme();
    // Inicializar con habilidades vacías o básicas hasta que el usuario cargue
    const [ability, setAbility] = useState(() => defineAbilitiesFor(null));

    // Restaurar useEffect de habilidad
    useEffect(() => {
        // Actualizar habilidades cuando el usuario cambie
        setAbility(defineAbilitiesFor(user));
    }, [user]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleSidebarCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Restaurar comprobación de carga
    if (loading) { 
        return (
            <div className="flex h-screen w-full justify-center items-center">
                <Spinner />
            </div>
        );
    }
    
    const isDetached = layoutMode === "detached";

    return (
        // Restaurar AbilityContext.Provider
        <AbilityContext.Provider value={ability}>
            <TooltipProvider delayDuration={0}>
                {/* Estructura visual del layout que antes estaba en layout.tsx */}
                <div className="relative">
                    <div className="flex h-screen overflow-hidden">
                        <aside
                            className={cn(
                                "fixed inset-y-0 z-50 overflow-y-auto bg-background transition-all duration-300 ease-in-out",
                                {
                                    "-left-4": !isSidebarOpen && isDetached && isMobile, // Lógica de posición
                                    "left-0": isSidebarOpen || !isDetached || !isMobile, 
                                },
                                isDetached ? "ml-2.5 mt-4 md:mt-4 md:ml-4 rounded-lg h-[calc(100vh-2rem)] shadow-2xl" : "h-screen shadow-xl md:static lg:z-auto", // Estilo detached
                                isSidebarCollapsed ? "md:w-20" : "w-60", // Ancho colapsado/expandido
                                isSidebarOpen ? "translate-x-0" : "-translate-x-full", // Desplazamiento móvil
                                "md:translate-x-0", // Reset desplazamiento en desktop
                            )}
                        >
                            <Sidebar
                                onClose={() => setIsSidebarOpen(false)}
                                isCollapsed={isSidebarCollapsed}
                                onToggleCollapse={toggleSidebarCollapse}
                                isMobile={isMobile}
                            />
                        </aside>
                        <div className="flex flex-1 flex-col overflow-hidden">
                            <TopBar onMenuToggle={toggleSidebar} sidebarCollapsed={isSidebarCollapsed}/>
                            <main
                                className={cn(
                                    "flex-1 p-4 min-h-[calc(100vh-4rem)] overflow-y-auto",
                                    // Lógica de margen basada en estado detached/collapsed
                                    !isSidebarCollapsed && isDetached ? "md:ml-24" : "md:ml-0", isSidebarCollapsed && isDetached ? "md:ml-24" : "mt-0",
                                    isDetached ? "mt-0" : "mt-0", 
                                )}
                            >
                                {/* El div interno para padding podría ajustarse según diseño */} 
                                <div className={cn("rounded-lg p-4", !isSidebarCollapsed && isDetached ? "mx-2 md:ml-40 ml-0" : "")}>
                                    {children} { /* Renderiza las páginas */}
                                </div> 
                            </main>
                        </div>
                    </div>
                </div>
            </TooltipProvider>
        </AbilityContext.Provider>
    );
} 
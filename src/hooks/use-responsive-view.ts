import { useDeviceType, useShouldShowCards, BREAKPOINTS } from "./use-mobile";

export interface ResponsiveViewConfig {
    mobile?: 'cards' | 'table' | 'list';
    tablet?: 'cards' | 'table' | 'list';
    laptop?: 'cards' | 'table' | 'list';
    desktop?: 'cards' | 'table' | 'list';
    defaultView?: 'cards' | 'table' | 'list';
}

export function useResponsiveView(config: ResponsiveViewConfig = {}) {
    const deviceType = useDeviceType();
    const shouldShowCards = useShouldShowCards();

    const {
        mobile = 'cards',
        tablet = 'cards',
        laptop = 'table',
        desktop = 'table',
        defaultView = 'table'
    } = config;

    const getViewForDevice = () => {
        switch (deviceType) {
            case 'mobile':
                return mobile;
            case 'tablet':
                return tablet;
            case 'laptop':
                return laptop;
            case 'desktop':
                return desktop;
            default:
                return defaultView;
        }
    };

    const currentView = getViewForDevice();
    const isCardsView = currentView === 'cards';
    const isTableView = currentView === 'table';
    const isListView = currentView === 'list';

    return {
        deviceType,
        currentView,
        isCardsView,
        isTableView,
        isListView,
        shouldShowCards,
        breakpoints: BREAKPOINTS,
        // Helper para determinar si cambiar vista
        shouldSwitchToCards: isCardsView,
        shouldSwitchToTable: isTableView,
        shouldSwitchToList: isListView
    };
}

// Hook específico para tablas responsivas
export function useResponsiveTable() {
  return useResponsiveView({
    mobile: 'cards',
    tablet: 'cards',
    laptop: 'cards', // Cambiar a cards para laptop
    desktop: 'table' // Desktop mantiene tabla por defecto
  });
}

// Hook específico para listas responsivas
export function useResponsiveList() {
    return useResponsiveView({
        mobile: 'list',
        tablet: 'list',
        laptop: 'table',
        desktop: 'table'
    });
}

// Hook específico para grids responsivos
export function useResponsiveGrid() {
  return useResponsiveView({
    mobile: 'cards',
    tablet: 'cards',
    laptop: 'cards',
    desktop: 'cards'
  });
}

// Hook para vista dual (tabla y cuadrícula) en desktop
export function useResponsiveDualView() {
  const deviceType = useDeviceType();
  
  // En desktop, permitir ambas vistas
  const isDesktop = deviceType === 'desktop';
  
  return {
    deviceType,
    isDesktop,
    // En desktop, siempre mostrar tabla por defecto, pero permitir cambio a cards
    defaultView: isDesktop ? 'table' : 'cards',
    // Determinar si mostrar selector de vista
    showViewSelector: isDesktop,
    // Vista recomendada por dispositivo
    recommendedView: deviceType === 'mobile' || deviceType === 'tablet' || deviceType === 'laptop' ? 'cards' : 'table'
  };
} 
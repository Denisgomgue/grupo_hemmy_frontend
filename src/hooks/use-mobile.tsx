import * as React from "react"

// Breakpoints más específicos
const BREAKPOINTS = {
  mobile: 640,    // < 640px - Móviles pequeños
  tablet: 768,    // 640px - 768px - Tablets pequeñas
  laptop: 1024,   // 768px - 1024px - Tablets grandes/Laptops pequeñas
  desktop: 1280   // > 1024px - Desktop
} as const

export type DeviceType = 'mobile' | 'tablet' | 'laptop' | 'desktop'

export function useIsMobile() {
  const [ isMobile, setIsMobile ] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.mobile)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

// Hook más específico para diferentes dispositivos
export function useDeviceType() {
  const [ deviceType, setDeviceType ] = React.useState<DeviceType>('desktop')

  React.useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth

      if (width < BREAKPOINTS.mobile) {
        setDeviceType('mobile')
      } else if (width < BREAKPOINTS.tablet) {
        setDeviceType('tablet')
      } else if (width < BREAKPOINTS.laptop) {
        setDeviceType('laptop')
      } else {
        setDeviceType('desktop')
      }
    }

    checkDeviceType()
    window.addEventListener("resize", checkDeviceType)
    return () => window.removeEventListener("resize", checkDeviceType)
  }, [])

  return deviceType
}

// Hook para determinar si mostrar vista de tarjetas
export function useShouldShowCards() {
  const deviceType = useDeviceType()

  // Mostrar tarjetas en móvil y tablet pequeña
  return deviceType === 'mobile' || deviceType === 'tablet'
}

// Hook para determinar si es tablet
export function useIsTablet() {
  const deviceType = useDeviceType()
  return deviceType === 'tablet'
}

// Hook para determinar si es laptop o desktop
export function useIsDesktop() {
  const deviceType = useDeviceType()
  return deviceType === 'laptop' || deviceType === 'desktop'
}

// Exportar breakpoints para uso en otros componentes
export { BREAKPOINTS }

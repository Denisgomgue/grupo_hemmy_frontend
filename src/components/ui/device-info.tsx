// "use client";

// import { useDeviceType, useShouldShowCards, BREAKPOINTS } from "@/hooks/use-mobile";
// import { useResponsiveDualView } from "@/hooks/use-responsive-view";
// import { Badge } from "@/components/ui/badge";

// interface DeviceInfoProps {
//     showBreakpoints?: boolean;
//     className?: string;
//     showPaymentStatus?: boolean;
// }

// export function DeviceInfo({ showBreakpoints = false, className = "", showPaymentStatus }: DeviceInfoProps) {
//     const deviceType = useDeviceType();
//     const shouldShowCards = useShouldShowCards();
//     const { isDesktop, showViewSelector, recommendedView } = useResponsiveDualView();

//     const getDeviceColor = (type: string) => {
//         switch (type) {
//             case 'mobile': return 'bg-red-500';
//             case 'tablet': return 'bg-yellow-500';
//             case 'laptop': return 'bg-blue-500';
//             case 'desktop': return 'bg-green-500';
//             default: return 'bg-gray-500';
//         }
//     };

//     if (process.env.NODE_ENV === 'production') {
//         return null; // No mostrar en producción
//     }

//     return (
//         <div className={`fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3 text-xs ${className}`}>
//             <div className="flex items-center gap-2 mb-2">
//                 <span className="font-medium">Dispositivo:</span>
//                 <Badge className={getDeviceColor(deviceType)}>
//                     {deviceType.toUpperCase()}
//                 </Badge>
//             </div>

//             <div className="flex items-center gap-2 mb-2">
//                 <span className="font-medium">Vista:</span>
//                 <Badge variant={shouldShowCards ? "default" : "secondary"}>
//                     {shouldShowCards ? "TARJETAS" : "TABLA"}
//                 </Badge>
//             </div>

//             <div className="flex items-center gap-2 mb-2">
//                 <span className="font-medium">Selector:</span>
//                 <Badge variant={showViewSelector ? "default" : "secondary"}>
//                     {showViewSelector ? "VISIBLE" : "OCULTO"}
//                 </Badge>
//             </div>

//             <div className="flex items-center gap-2 mb-2">
//                 <span className="font-medium">Recomendado:</span>
//                 <Badge variant="outline">
//                     {recommendedView.toUpperCase()}
//                 </Badge>
//             </div>

//             <div className="flex items-center gap-2 mb-2">
//                 <span className="font-medium">Layout:</span>
//                 <Badge variant="outline">
//                     {deviceType === 'mobile' || deviceType === 'tablet' ? 'UNA FILA' : 'DOS FILAS'}
//                 </Badge>
//             </div>

//             <div className="flex items-center gap-2 mb-2">
//                 <span className="font-medium">Cards:</span>
//                 <Badge variant="outline">
//                     {deviceType === 'mobile' ? '1 COL' :
//                         deviceType === 'tablet' || deviceType === 'laptop' ? '2 COLS' : '4 COLS'}
//                 </Badge>
//             </div>

//             <div className="flex items-center gap-2 mb-2">
//                 <span className="font-medium">Vista Cards:</span>
//                 <Badge variant="outline">
//                     {showPaymentStatus ? 'PAGOS' : 'ESTADO'}
//                 </Badge>
//             </div>

//             <div className="text-muted-foreground">
//                 {window.innerWidth}px
//             </div>

//             {showBreakpoints && (
//                 <div className="mt-2 text-xs text-muted-foreground">
//                     <div>Mobile: &lt; {BREAKPOINTS.mobile}px</div>
//                     <div>Tablet: {BREAKPOINTS.mobile}-{BREAKPOINTS.tablet}px</div>
//                     <div>Laptop: {BREAKPOINTS.tablet}-{BREAKPOINTS.laptop}px</div>
//                     <div>Desktop: &gt; {BREAKPOINTS.laptop}px</div>
//                 </div>
//             )}
//         </div>
//     );
// } 
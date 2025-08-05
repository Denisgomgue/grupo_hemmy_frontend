import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, startOfDay } from "date-fns"
import { es } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toFloat(value: any): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  return parseFloat(parseFloat(value.toString()).toFixed(2));
}

/**
 * Transforma los datos de pago del frontend al formato esperado por el backend
 * @param paymentData - Datos del formulario de pago
 * @returns Datos transformados para el backend
 */
export function transformPaymentDataForBackend(paymentData: any) {
  const transformedData = {
    ...paymentData,
    client: paymentData.clientId, // Transformar clientId a client
  };

  // Eliminar clientId para evitar confusión
  delete transformedData.clientId;

  return transformedData;
}

/**
 * Valida que los datos de pago tengan el cliente correcto
 * @param paymentData - Datos del pago
 * @returns true si los datos son válidos
 */
export function validatePaymentData(paymentData: any): boolean {
  return paymentData.client && typeof paymentData.client === 'number' && paymentData.client > 0;
}

/**
 * Función mejorada de transformación con logging y validación
 * @param paymentData - Datos del formulario de pago
 * @returns Datos transformados para el backend
 */
export function transformPaymentDataForBackendWithLogging(paymentData: any) {
  // Log removido para limpieza
  const transformedData = transformPaymentDataForBackend(paymentData);
  // Log removido para limpieza
  return transformedData;
}

/**
 * Obtiene la fecha actual de manera consistente
 * @returns Fecha actual en formato "yyyy-MM-dd"
 */
export function getCurrentDateString(): string {
  const now = new Date();
  // Usar startOfDay para evitar problemas de zona horaria
  const today = startOfDay(now);
  return format(today, "yyyy-MM-dd");
}

/**
 * Formatea una fecha de manera segura
 * @param dateString - Fecha a formatear (string, Date o undefined)
 * @returns Fecha formateada en formato "yyyy-MM-dd" o fecha actual si hay error
 */
export function formatDateSafely(dateString: string | Date | undefined): string {
  if (!dateString) return getCurrentDateString();

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return format(startOfDay(date), "yyyy-MM-dd");
  } catch (error) {
    console.warn('Error formateando fecha:', dateString, error);
    return getCurrentDateString();
  }
}

/**
 * Formatea una fecha para mostrar en la UI (dd/MM/yyyy)
 * Maneja correctamente las zonas horarias para evitar problemas de un día menos
 * @param dateInput - Fecha a formatear (string, Date o undefined)
 * @returns Fecha formateada en formato "dd/MM/yyyy" o "N/A" si hay error
 */
export function formatDateForDisplay(dateInput: string | Date | undefined): string {
  if (!dateInput) return "N/A";

  try {
    let date: Date;

    if (typeof dateInput === 'string') {
      // Si es un string en formato YYYY-MM-DD, crear fecha local sin zona horaria
      if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [ year, month, day ] = dateInput.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } else if (dateInput.includes('T')) {
        // Es formato ISO, extraer solo la fecha
        const dateOnly = dateInput.split('T')[ 0 ];
        const [ year, month, day ] = dateOnly.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        // Otro formato, intentar parsearlo
        date = new Date(dateInput);
      }
    } else {
      date = dateInput;
    }

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }

    // Formatear la fecha usando date-fns
    return format(date, "dd/MM/yyyy", { locale: es });
  } catch (error) {
    console.warn('Error formateando fecha para display:', dateInput, error);
    return "N/A";
  }
}

/**
 * Crea una fecha a partir de un string evitando problemas de zona horaria
 * @param dateString - String de fecha (YYYY-MM-DD o ISO)
 * @returns Date object
 */
export function createDateFromString(dateString: string): Date {
  if (!dateString) return new Date();

  try {
    if (dateString.includes('T')) {
      // Es formato ISO, extraer solo la fecha
      const dateOnly = dateString.split('T')[ 0 ];
      return new Date(dateOnly + 'T00:00:00');
    } else {
      // Es formato YYYY-MM-DD, crear fecha local
      return new Date(dateString + 'T00:00:00');
    }
  } catch (error) {
    console.warn('Error creando fecha desde string:', dateString, error);
    return new Date();
  }
}

/**
 * Convierte una fecha a string para enviar al backend evitando problemas de zona horaria
 * @param date - Fecha a convertir (Date o undefined)
 * @returns String en formato YYYY-MM-DD o undefined
 */
export function formatDateForBackend(date: Date | undefined): string | undefined {
  if (!date) return undefined;

  try {
    // Log removido para limpieza
    // Log removido para limpieza

    // Usar startOfDay para normalizar la fecha y evitar problemas de zona horaria
    const normalizedDate = startOfDay(date);
    console.log('🔧 formatDateForBackend - Fecha normalizada:', normalizedDate);

    const result = format(normalizedDate, "yyyy-MM-dd");
    console.log('🔧 formatDateForBackend - Resultado:', result);

    return result;
  } catch (error) {
    console.warn('Error formateando fecha para backend:', date, error);
    return undefined;
  }
}

/**
 * 🔢 FUNCIÓN: Calcula la próxima fecha de pago manteniendo el mismo día del mes
 * 
 * 📋 LÓGICA:
 * 1. Obtiene el día del mes original (ej: 17)
 * 2. Suma 1 mes a la fecha base
 * 3. Asegura que el día sea el mismo que el original
 * 4. Si el mes siguiente no tiene ese día, usa el último día disponible
 * 
 * 📅 EJEMPLOS:
 * - 17/10/2025 → 17/11/2025 ✅
 * - 31/01/2025 → 28/02/2025 ✅ (febrero no tiene 31)
 * - 30/03/2025 → 30/04/2025 ✅
 * 
 * @param baseDate - Fecha base para calcular la siguiente
 * @returns Fecha del siguiente mes con el mismo día
 */
export function calculateNextPaymentDate(baseDate: Date): Date {
  // 🔍 PASO 1: Obtener el día del mes original (ej: 17)
  const originalDay = baseDate.getDate();

  // 🔍 PASO 2: Crear nueva fecha sumando 1 mes
  const nextDate = new Date(baseDate);
  nextDate.setMonth(nextDate.getMonth() + 1);

  // 🔍 PASO 3: Asegurar que el día sea el mismo que el original
  // Si el mes siguiente no tiene ese día, usar el último día del mes
  const maxDay = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
  const targetDay = Math.min(originalDay, maxDay);
  nextDate.setDate(targetDay);

  return nextDate;
}

/**
 * Normaliza una fecha seleccionada del calendario para evitar problemas de zona horaria
 * @param date - Fecha seleccionada del calendario
 * @returns Date normalizada
 */
export function normalizeCalendarDate(date: Date | undefined): Date | undefined {
  if (!date) return undefined;

  try {
    // Log removido para limpieza
    // Log removido para limpieza

    // Crear una nueva fecha usando solo año, mes y día para evitar problemas de zona horaria
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Crear fecha local sin zona horaria
    const normalizedDate = new Date(year, month, day);

    // Log removido para limpieza
    // Log removido para limpieza

    return normalizedDate;
  } catch (error) {
    console.warn('Error normalizando fecha del calendario:', date, error);
    return undefined;
  }
}

/**
 * 🎯 FUNCIÓN UTILITARIA: Calcula la próxima fecha de pago para mostrar
 * Se puede reutilizar en formularios, cards, y cualquier lugar donde se necesite
 * 
 * @param initialPaymentDate - Fecha inicial de pago
 * @param numberOfPayments - Número de pagos existentes
 * @returns Fecha calculada en formato string dd/MM/yyyy
 */
export function calculateNextPaymentDateForDisplay(
  initialPaymentDate: string | Date | undefined,
  numberOfPayments: number
): string {
  if (!initialPaymentDate) return "N/A";

  try {
    // ✅ SOLUCIÓN: Usar createDateFromString para evitar problemas de zona horaria
    const baseDate = createDateFromString(initialPaymentDate.toString());

    if (numberOfPayments === 0) {
      // 🎯 CASO A: Es el primer pago - usar initialPaymentDate directamente
      return format(baseDate, "dd/MM/yyyy", { locale: es });
    } else {
      // 🎯 CASO B: Hay pagos previos - calcular desde initialPaymentDate sumando meses según cantidad de pagos
      let nextDueDate = new Date(baseDate);
      for (let i = 0; i < numberOfPayments; i++) {
        nextDueDate = calculateNextPaymentDate(nextDueDate);
      }
      return format(nextDueDate, "dd/MM/yyyy", { locale: es });
    }
  } catch (error) {
    // Log removido para limpieza
    return "N/A";
  }
}

import { format } from "date-fns"
import { es } from "date-fns/locale"

export const formatDateWithTime = (date: Date) => {
  return format(date, "MMM d, yyyy h:mm a", { locale: es })
}

export const formatDate = (date: string | Date) => {
  const parsedDate = typeof date === 'string' ? new Date(`${date}T00:00:00Z`) : date;
  return format(parsedDate, "MMM d, yyyy", { locale: es });
}
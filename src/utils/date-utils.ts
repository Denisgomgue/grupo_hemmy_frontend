import { format, formatDistanceToNow, parseISO } from "date-fns"
import { es } from "date-fns/locale"

export function formatDate(date: Date | string | undefined): string {
    if (!date) return "N/A"

    try {
        const dateObj = typeof date === "string" ? parseISO(date) : date
        return format(dateObj, "dd/MM/yyyy", { locale: es })
    } catch (error) {
        return "Fecha inválida"
    }
}

export function formatDateTime(date: Date | string | undefined): string {
    if (!date) return "N/A"

    try {
        const dateObj = typeof date === "string" ? parseISO(date) : date
        return format(dateObj, "dd/MM/yyyy HH:mm", { locale: es })
    } catch (error) {
        return "Fecha inválida"
    }
}

export function formatTime(date: Date | string | undefined): string {
    if (!date) return "N/A"

    try {
        const dateObj = typeof date === "string" ? parseISO(date) : date
        return format(dateObj, "HH:mm", { locale: es })
    } catch (error) {
        return "Hora inválida"
    }
}

export function formatRelativeTime(date: Date | string | undefined): string {
    if (!date) return "N/A"

    try {
        const dateObj = typeof date === "string" ? parseISO(date) : date
        return formatDistanceToNow(dateObj, { addSuffix: true, locale: es })
    } catch (error) {
        return "Fecha inválida"
    }
}

export function formatDateRange(startDate: Date | string | undefined, endDate: Date | string | undefined): string {
    if (!startDate || !endDate) return "N/A"

    try {
        const start = typeof startDate === "string" ? parseISO(startDate) : startDate
        const end = typeof endDate === "string" ? parseISO(endDate) : endDate

        const startFormatted = format(start, "dd/MM/yyyy", { locale: es })
        const endFormatted = format(end, "dd/MM/yyyy", { locale: es })

        return `${startFormatted} - ${endFormatted}`
    } catch (error) {
        return "Rango de fechas inválido"
    }
}

export function isToday(date: Date | string | undefined): boolean {
    if (!date) return false

    try {
        const dateObj = typeof date === "string" ? parseISO(date) : date
        const today = new Date()

        return format(dateObj, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
    } catch (error) {
        return false
    }
}

export function isYesterday(date: Date | string | undefined): boolean {
    if (!date) return false

    try {
        const dateObj = typeof date === "string" ? parseISO(date) : date
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        return format(dateObj, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")
    } catch (error) {
        return false
    }
}

export function isThisWeek(date: Date | string | undefined): boolean {
    if (!date) return false

    try {
        const dateObj = typeof date === "string" ? parseISO(date) : date
        const today = new Date()
        const weekAgo = new Date()
        weekAgo.setDate(today.getDate() - 7)

        return dateObj >= weekAgo && dateObj <= today
    } catch (error) {
        return false
    }
}

export function isThisMonth(date: Date | string | undefined): boolean {
    if (!date) return false

    try {
        const dateObj = typeof date === "string" ? parseISO(date) : date
        const today = new Date()

        return format(dateObj, "yyyy-MM") === format(today, "yyyy-MM")
    } catch (error) {
        return false
    }
}

export function getAge(birthDate: Date | string | undefined): number | null {
    if (!birthDate) return null

    try {
        const birth = typeof birthDate === "string" ? parseISO(birthDate) : birthDate
        const today = new Date()

        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }

        return age
    } catch (error) {
        return null
    }
}

export function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} min`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (remainingMinutes === 0) {
        return `${hours}h`
    }

    return `${hours}h ${remainingMinutes}min`
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = [ "Bytes", "KB", "MB", "GB", "TB" ]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[ i ]
} 
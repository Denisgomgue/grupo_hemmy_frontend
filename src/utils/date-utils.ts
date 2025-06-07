import { format, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import type { Client } from "@/types/clients/client";

const parseUTCDate = (dateString: string): Date => {
    const date = new Date(dateString);
    // Ajustar la fecha para que sea UTC y mantener el mismo día
    return new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12, // Usar mediodía UTC para evitar problemas con zonas horarias
        0,
        0,
        0
    ));
};

const formatDateDisplay = (date: Date): string => {
    return format(date, "dd/MM/yyyy", { locale: es });
};

export const getDisplayPaymentDate = (client: Client): { date: string; isFromInitial: boolean } => {
    // Si hay una fecha de próximo pago, usarla
    if (client.paymentDate) {
        const paymentDate = parseUTCDate(client.paymentDate);
        return {
            date: formatDateDisplay(paymentDate),
            isFromInitial: false
        };
    }

    // Si no hay fecha de próximo pago pero hay fecha inicial, calcular basado en la fecha inicial
    if (client.initialPaymentDate) {
        const initialDate = parseUTCDate(client.initialPaymentDate);
        const today = new Date();

        // Calcular cuántos meses han pasado desde la fecha inicial
        let monthsDiff = (today.getFullYear() - initialDate.getFullYear()) * 12
            + (today.getMonth() - initialDate.getMonth());

        // Si el día del mes actual es mayor que el día inicial, agregar un mes más
        if (today.getDate() > initialDate.getDate()) {
            monthsDiff++;
        }

        // Calcular la próxima fecha de pago
        const nextDate = addMonths(initialDate, monthsDiff + 1);

        return {
            date: formatDateDisplay(nextDate),
            isFromInitial: true
        };
    }

    return {
        date: "No definida",
        isFromInitial: false
    };
};

export const calculateNextPaymentDate = (baseDate: Date): Date => {
    const utcDate = parseUTCDate(baseDate.toISOString());
    return addMonths(utcDate, 1);
}; 
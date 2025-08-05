import { Payment, PaymentType } from '@/types/payments/payment';
import { Plan } from '@/types/plans/plan';
import { Service } from '@/types/services/service';

/**
 * Obtiene el nombre del servicio actual del pago
 */
export const getCurrentServiceName = (payment: Payment): string => {
    if (payment.currentService?.name) {
        return payment.currentService.name;
    }

    if (payment.currentPlan?.service?.name) {
        return payment.currentPlan.service.name;
    }

    // Fallback: intentar obtener de la instalación del cliente
    const installations = payment.client?.installations;
    if (installations && installations.length > 0) {
        const installation = installations[ 0 ];
        if (installation.plan?.service?.name) {
            return installation.plan.service.name;
        }
    }

    return 'Servicio de Internet';
};

/**
 * Obtiene el nombre del plan actual del pago
 */
export const getCurrentPlanName = (payment: Payment): string => {
    if (payment.currentPlan?.name) {
        return payment.currentPlan.name;
    }

    // Fallback: intentar obtener de la instalación del cliente
    const installations = payment.client?.installations;
    if (installations && installations.length > 0) {
        const installation = installations[ 0 ];
        if (installation.plan?.name) {
            return installation.plan.name;
        }
    }

    return 'Plan Básico';
};

/**
 * Obtiene la velocidad del plan actual
 */
export const getCurrentPlanSpeed = (payment: Payment): string => {
    let speed = payment.currentPlan?.speed;
    
    if (!speed) {
        const installations = payment.client?.installations;
        if (installations && installations.length > 0) {
            speed = installations[0].plan?.speed;
        }
    }

    if (speed) {
        return `${speed} Mbps`;
    }

    return 'Velocidad no especificada';
};

/**
 * Obtiene el precio del plan actual
 */
export const getCurrentPlanPrice = (payment: Payment): number => {
    let price = payment.currentPlan?.price;
    
    if (!price) {
        const installations = payment.client?.installations;
        if (installations && installations.length > 0) {
            price = installations[0].plan?.price;
        }
    }

    return price || 0;
};

/**
 * Obtiene la descripción del plan actual
 */
export const getCurrentPlanDescription = (payment: Payment): string => {
    let description = payment.currentPlan?.description;
    
    if (!description) {
        const installations = payment.client?.installations;
        if (installations && installations.length > 0) {
            description = installations[0].plan?.description;
        }
    }

    return description || 'Sin descripción';
};

/**
 * Verifica si es un cambio de plan
 */
export const isPlanChange = (payment: Payment): boolean => {
    return payment.isPlanChange === true ||
        (!!payment.previousPlan && !!payment.currentPlan);
};

/**
 * Obtiene información del plan anterior (para cambios de plan)
 */
export const getPreviousPlanInfo = (payment: Payment) => {
    if (!isPlanChange(payment)) {
        return null;
    }

    return {
        name: payment.previousPlan?.name || 'Plan Anterior',
        speed: payment.previousPlan?.speed ? `${payment.previousPlan.speed} Mbps` : 'N/A',
        price: payment.previousPlan?.price || 0,
        service: payment.previousService?.name || payment.previousPlan?.service?.name || 'N/A'
    };
};

/**
 * Obtiene información del plan actual
 */
export const getCurrentPlanInfo = (payment: Payment) => {
    return {
        name: getCurrentPlanName(payment),
        speed: getCurrentPlanSpeed(payment),
        price: getCurrentPlanPrice(payment),
        service: getCurrentServiceName(payment),
        description: getCurrentPlanDescription(payment)
    };
};

/**
 * Obtiene el resumen completo del plan para el ticket
 */
export const getPlanSummary = (payment: Payment) => {
    const currentPlan = getCurrentPlanInfo(payment);
    const isChange = isPlanChange(payment);
    const previousPlan = isChange ? getPreviousPlanInfo(payment) : null;

    return {
        current: currentPlan,
        previous: previousPlan,
        isChange,
        changeType: isChange ? 'CAMBIO DE PLAN' : 'PAGO REGULAR'
    };
};

/**
 * Obtiene el icono apropiado según el tipo de pago y plan
 */
export const getPlanIcon = (payment: Payment): string => {
    if (isPlanChange(payment)) {
        return '🔄'; // Cambio de plan
    }

    const serviceName = getCurrentServiceName(payment).toLowerCase();

    if (serviceName.includes('internet')) {
        return '🌐';
    } else if (serviceName.includes('tv') || serviceName.includes('televisión')) {
        return '📺';
    } else if (serviceName.includes('teléfono') || serviceName.includes('telefono')) {
        return '📞';
    } else if (serviceName.includes('wifi')) {
        return '📶';
    } else {
        return '📡'; // Default para servicios de telecomunicaciones
    }
};

/**
 * Obtiene el mensaje descriptivo del pago según el tipo
 */
export const getPaymentDescription = (payment: Payment): string => {
    if (isPlanChange(payment)) {
        const previous = getPreviousPlanInfo(payment);
        const current = getCurrentPlanInfo(payment);

        return `Cambio de plan: ${previous?.name} → ${current.name}`;
    }

    if (payment.reconnection) {
        return 'Pago por reconexión de servicio';
    }

    if (payment.advancePayment) {
        return 'Pago anticipado';
    }

    return `Pago mensual - ${getCurrentPlanName(payment)}`;
};

/**
 * Calcula el descuento aplicado
 */
export const getDiscountInfo = (payment: Payment) => {
    if (!payment.discount || payment.discount <= 0) {
        return null;
    }

    const planPrice = getCurrentPlanPrice(payment);
    const discountPercentage = (payment.discount / planPrice) * 100;

    return {
        amount: payment.discount,
        percentage: discountPercentage.toFixed(1),
        originalPrice: planPrice,
        finalPrice: payment.amount
    };
};

/**
 * Obtiene información detallada para el ticket
 */
export const getTicketDetails = (payment: Payment) => {
    const planSummary = getPlanSummary(payment);
    const discountInfo = getDiscountInfo(payment);

    return {
        plan: planSummary,
        discount: discountInfo,
        description: getPaymentDescription(payment),
        icon: getPlanIcon(payment),
        isReconnection: payment.reconnection,
        isAdvancePayment: payment.advancePayment,
        isPlanChange: planSummary.isChange
    };
}; 
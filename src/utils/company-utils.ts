import { CompanyInfo, LogoType } from '@/types/company/company';

/**
 * Obtiene la dirección completa formateada de la empresa
 */
export const getFullAddress = (company: CompanyInfo): string => {
    const parts = [
        company.address,
        company.district,
        company.city,
        company.province,
        company.country
    ].filter(Boolean);

    return parts.join(', ');
};

/**
 * Obtiene la dirección corta (solo ciudad y provincia)
 */
export const getShortAddress = (company: CompanyInfo): string => {
    const parts = [ company.city, company.province ].filter(Boolean);
    return parts.join(', ');
};

/**
 * Obtiene el logo según el tipo especificado
 */
export const getLogoByType = (company: CompanyInfo, type: LogoType): string | undefined => {
    return company.logos?.[ type ];
};

/**
 * Obtiene el logo más apropiado según el contexto
 */
export const getBestLogo = (company: CompanyInfo, context: 'header' | 'footer' | 'document' | 'small' = 'normal'): string | undefined => {
    switch (context) {
        case 'header':
            return company.logos?.horizontal || company.logos?.normal;
        case 'footer':
            return company.logos?.reduced || company.logos?.normal;
        case 'document':
            return company.logos?.horizontal || company.logos?.normal;
        case 'small':
            return company.logos?.reduced || company.logos?.normal;
        default:
            return company.logos?.normal;
    }
};

/**
 * Formatea el RUC con separadores
 */
export const formatRUC = (ruc: string): string => {
    if (!ruc) return '';
    // Formato: 20-12345678-9
    if (ruc.length === 11) {
        return `${ruc.slice(0, 2)}${ruc.slice(2, 10)}${ruc.slice(10)}`;
    }
    return ruc;
};

/**
 * Formatea el teléfono con separadores
 */
export const formatPhone = (phone: string): string => {
    if (!phone) return '';

    // Remover todos los caracteres no numéricos
    const cleanPhone = phone.replace(/\D/g, '');

    // Si empieza con código de país
    if (cleanPhone.startsWith('51') && cleanPhone.length === 11) {
        return `+${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 5)} ${cleanPhone.slice(5, 8)} ${cleanPhone.slice(8)}`;
    }

    // Si es un número local de 9 dígitos
    if (cleanPhone.length === 9) {
        return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`;
    }

    return phone;
};

/**
 * Obtiene las redes sociales como objeto
 */
export const getSocialMedia = (company: CompanyInfo) => {
    if (!company.socialMedia) return null;

    try {
        return typeof company.socialMedia === 'string'
            ? JSON.parse(company.socialMedia)
            : company.socialMedia;
    } catch {
        return null;
    }
};

/**
 * Obtiene el enlace de WhatsApp con el número de la empresa
 */
export const getWhatsAppLink = (company: CompanyInfo, message?: string): string => {
    if (!company.phone) return '';

    const cleanPhone = company.phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;

    const defaultMessage = `Hola, necesito información sobre los servicios de ${company.name}`;
    const finalMessage = message || defaultMessage;

    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(finalMessage)}`;
};

/**
 * Obtiene el enlace de llamada telefónica
 */
export const getPhoneLink = (company: CompanyInfo): string => {
    if (!company.phone) return '';
    return `tel:${company.phone}`;
};

/**
 * Obtiene el enlace de email
 */
export const getEmailLink = (company: CompanyInfo, subject?: string, body?: string): string => {
    if (!company.email) return '';

    const defaultSubject = `Consulta sobre servicios - ${company.name}`;
    const defaultBody = `Hola,\n\nMe gustaría obtener información sobre los servicios de ${company.name}.\n\nSaludos.`;

    const finalSubject = subject || defaultSubject;
    const finalBody = body || defaultBody;

    return `mailto:${company.email}?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(finalBody)}`;
};

/**
 * Valida si la empresa tiene información mínima requerida
 */
export const hasMinimumCompanyInfo = (company: CompanyInfo): boolean => {
    return !!(company.name && company.businessName && company.ruc);
};

/**
 * Obtiene información de contacto formateada
 */
export const getContactInfo = (company: CompanyInfo) => {
    return {
        phone: company.phone ? formatPhone(company.phone) : null,
        email: company.email,
        website: company.website,
        address: getFullAddress(company),
        shortAddress: getShortAddress(company),
        whatsappLink: getWhatsAppLink(company),
        phoneLink: getPhoneLink(company),
        emailLink: getEmailLink(company)
    };
};

/**
 * Obtiene información para documentos (tickets, recibos, etc.)
 */
export const getDocumentInfo = (company: CompanyInfo) => {
    return {
        name: company.businessName,
        ruc: formatRUC(company.ruc),
        address: company.address,
        phone: company.phone ? formatPhone(company.phone) : null,
        email: company.email,
        logo: getBestLogo(company, 'document'),
        slogan: company.slogan,
        businessHours: company.businessHours,
        taxCategory: company.taxCategory,
        economicActivity: company.economicActivity
    };
}; 
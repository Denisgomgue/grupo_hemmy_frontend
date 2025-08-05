export interface Company {
    id: number;
    name: string;
    businessName: string;
    ruc: string;
    address?: string;
    district?: string;
    city?: string;
    province?: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
    logoNormal?: string;
    logoHorizontal?: string;
    logoReduced?: string;
    logoNegative?: string;
    slogan?: string;
    mission?: string;
    vision?: string;
    socialMedia?: string; // JSON string
    businessHours?: string;
    taxCategory?: string;
    economicActivity?: string;
    isActive: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CompanyInfo {
    id: number;
    name: string;
    businessName: string;
    ruc: string;
    address?: string;
    district?: string;
    city?: string;
    province?: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
    logos: {
        normal?: string;
        horizontal?: string;
        reduced?: string;
        negative?: string;
    };
    slogan?: string;
    mission?: string;
    vision?: string;
    socialMedia?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        linkedin?: string;
        youtube?: string;
    };
    businessHours?: string;
    taxCategory?: string;
    economicActivity?: string;
}

export interface CreateCompanyDto {
    name: string;
    businessName: string;
    ruc: string;
    address?: string;
    district?: string;
    city?: string;
    province?: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
    logoNormal?: string;
    logoHorizontal?: string;
    logoReduced?: string;
    logoNegative?: string;
    slogan?: string;
    mission?: string;
    vision?: string;
    socialMedia?: string;
    businessHours?: string;
    taxCategory?: string;
    economicActivity?: string;
    isActive?: boolean;
}

export interface UpdateCompanyDto extends Partial<CreateCompanyDto> { }

export type LogoType = 'normal' | 'horizontal' | 'reduced' | 'negative';

export interface CompanyLogos {
    normal?: string;
    horizontal?: string;
    reduced?: string;
    negative?: string;
} 
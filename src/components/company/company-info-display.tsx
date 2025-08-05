import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Phone,
    Mail,
    Globe,
    MapPin,
    Building2,
    FileText,
    Clock,
    Hash,
    Briefcase
} from 'lucide-react';
import { useCompany } from '@/hooks/use-company';
import {
    getContactInfo,
    getDocumentInfo,
    getSocialMedia,
    getBestLogo,
    getWhatsAppLink,
    getPhoneLink,
    getEmailLink
} from '@/utils/company-utils';

interface CompanyInfoDisplayProps {
    showActions?: boolean;
    variant?: 'compact' | 'full' | 'card';
}

export function CompanyInfoDisplay({
    showActions = true,
    variant = 'full'
}: CompanyInfoDisplayProps) {
    const { companyInfo, isLoadingInfo, errorInfo } = useCompany();

    if (isLoadingInfo) {
        return <CompanyInfoSkeleton variant={variant} />;
    }

    if (errorInfo || !companyInfo) {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                    <p className="text-red-600">
                        No se pudo cargar la información de la empresa
                    </p>
                </CardContent>
            </Card>
        );
    }

    const contactInfo = getContactInfo(companyInfo);
    const documentInfo = getDocumentInfo(companyInfo);
    const socialMedia = getSocialMedia(companyInfo);
    const logo = getBestLogo(companyInfo, 'header');

    if (variant === 'compact') {
        return (
            <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
                {logo && (
                    <img
                        src={logo}
                        alt={companyInfo.name}
                        className="w-12 h-12 object-contain"
                    />
                )}
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{companyInfo.name}</h3>
                    <p className="text-sm text-gray-600">{documentInfo.ruc}</p>
                    {contactInfo.shortAddress && (
                        <p className="text-xs text-gray-500">{contactInfo.shortAddress}</p>
                    )}
                </div>
                {showActions && contactInfo.phone && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(contactInfo.phoneLink, '_blank')}
                    >
                        <Phone className="w-4 h-4" />
                    </Button>
                )}
            </div>
        );
    }

    if (variant === 'card') {
        return (
            <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
                    <div className="flex items-center space-x-3">
                        {logo && (
                            <img
                                src={logo}
                                alt={companyInfo.name}
                                className="w-10 h-10 object-contain bg-white rounded"
                            />
                        )}
                        <div>
                            <CardTitle className="text-lg">{companyInfo.name}</CardTitle>
                            <p className="text-purple-100 text-sm">{companyInfo.businessName}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {/* Información básica */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                                <Hash className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">RUC:</span>
                                <span className="font-medium">{documentInfo.ruc}</span>
                            </div>
                            {companyInfo.taxCategory && (
                                <div className="flex items-center space-x-2">
                                    <Building2 className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600">Categoría:</span>
                                    <span className="font-medium">{companyInfo.taxCategory}</span>
                                </div>
                            )}
                        </div>

                        {/* Contacto */}
                        {contactInfo.phone && (
                            <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Teléfono:</span>
                                <span className="font-medium">{contactInfo.phone}</span>
                            </div>
                        )}

                        {contactInfo.email && (
                            <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium">{contactInfo.email}</span>
                            </div>
                        )}

                        {contactInfo.website && (
                            <div className="flex items-center space-x-2">
                                <Globe className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Web:</span>
                                <a
                                    href={contactInfo.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-blue-600 hover:underline"
                                >
                                    {contactInfo.website}
                                </a>
                            </div>
                        )}

                        {contactInfo.address && (
                            <div className="flex items-start space-x-2">
                                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                                <span className="text-gray-600">Dirección:</span>
                                <span className="font-medium">{contactInfo.address}</span>
                            </div>
                        )}

                        {/* Información corporativa */}
                        {companyInfo.slogan && (
                            <div className="pt-2 border-t">
                                <p className="text-sm italic text-gray-600">"{companyInfo.slogan}"</p>
                            </div>
                        )}

                        {companyInfo.businessHours && (
                            <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Horario:</span>
                                <span className="font-medium">{companyInfo.businessHours}</span>
                            </div>
                        )}

                        {companyInfo.economicActivity && (
                            <div className="flex items-center space-x-2">
                                <Briefcase className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Actividad:</span>
                                <span className="font-medium">{companyInfo.economicActivity}</span>
                            </div>
                        )}

                        {/* Acciones */}
                        {showActions && (
                            <div className="flex space-x-2 pt-4 border-t">
                                {contactInfo.whatsappLink && (
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => window.open(contactInfo.whatsappLink, '_blank')}
                                    >
                                        WhatsApp
                                    </Button>
                                )}
                                {contactInfo.phoneLink && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(contactInfo.phoneLink, '_blank')}
                                    >
                                        Llamar
                                    </Button>
                                )}
                                {contactInfo.emailLink && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(contactInfo.emailLink, '_blank')}
                                    >
                                        Email
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Variant 'full'
    return (
        <div className="space-y-6">
            {/* Header con logo */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {logo && (
                            <img
                                src={logo}
                                alt={companyInfo.name}
                                className="w-16 h-16 object-contain bg-white rounded-lg p-2"
                            />
                        )}
                        <div>
                            <h1 className="text-2xl font-bold">{companyInfo.name}</h1>
                            <p className="text-purple-100">{companyInfo.businessName}</p>
                            {companyInfo.slogan && (
                                <p className="text-purple-200 italic mt-1">"{companyInfo.slogan}"</p>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <Badge variant="secondary" className="bg-white text-purple-800">
                            {documentInfo.ruc}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Información detallada */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información de contacto */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Phone className="w-5 h-5" />
                            <span>Información de Contacto</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {contactInfo.phone && (
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Teléfono:</span>
                                <span className="font-medium">{contactInfo.phone}</span>
                            </div>
                        )}
                        {contactInfo.email && (
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium">{contactInfo.email}</span>
                            </div>
                        )}
                        {contactInfo.website && (
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Website:</span>
                                <a
                                    href={contactInfo.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-blue-600 hover:underline"
                                >
                                    Visitar
                                </a>
                            </div>
                        )}
                        {contactInfo.address && (
                            <div className="flex items-start justify-between">
                                <span className="text-gray-600">Dirección:</span>
                                <span className="font-medium text-right">{contactInfo.address}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Información corporativa */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Building2 className="w-5 h-5" />
                            <span>Información Corporativa</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {companyInfo.taxCategory && (
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Categoría Tributaria:</span>
                                <span className="font-medium">{companyInfo.taxCategory}</span>
                            </div>
                        )}
                        {companyInfo.economicActivity && (
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Actividad Económica:</span>
                                <span className="font-medium">{companyInfo.economicActivity}</span>
                            </div>
                        )}
                        {companyInfo.businessHours && (
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Horario de Atención:</span>
                                <span className="font-medium">{companyInfo.businessHours}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Misión y Visión */}
            {(companyInfo.mission || companyInfo.vision) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {companyInfo.mission && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="w-5 h-5" />
                                    <span>Misión</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700">{companyInfo.mission}</p>
                            </CardContent>
                        </Card>
                    )}
                    {companyInfo.vision && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="w-5 h-5" />
                                    <span>Visión</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700">{companyInfo.vision}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Redes sociales */}
            {socialMedia && Object.values(socialMedia).some(Boolean) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Redes Sociales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex space-x-4">
                            {socialMedia.facebook && (
                                <a
                                    href={socialMedia.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    Facebook
                                </a>
                            )}
                            {socialMedia.instagram && (
                                <a
                                    href={socialMedia.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-pink-600 hover:text-pink-800"
                                >
                                    Instagram
                                </a>
                            )}
                            {socialMedia.twitter && (
                                <a
                                    href={socialMedia.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-600"
                                >
                                    Twitter
                                </a>
                            )}
                            {socialMedia.linkedin && (
                                <a
                                    href={socialMedia.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-700 hover:text-blue-900"
                                >
                                    LinkedIn
                                </a>
                            )}
                            {socialMedia.youtube && (
                                <a
                                    href={socialMedia.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-red-600 hover:text-red-800"
                                >
                                    YouTube
                                </a>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Acciones */}
            {showActions && (
                <Card>
                    <CardHeader>
                        <CardTitle>Acciones Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            {contactInfo.whatsappLink && (
                                <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => window.open(contactInfo.whatsappLink, '_blank')}
                                >
                                    <Phone className="w-4 h-4 mr-2" />
                                    WhatsApp
                                </Button>
                            )}
                            {contactInfo.phoneLink && (
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(contactInfo.phoneLink, '_blank')}
                                >
                                    <Phone className="w-4 h-4 mr-2" />
                                    Llamar
                                </Button>
                            )}
                            {contactInfo.emailLink && (
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(contactInfo.emailLink, '_blank')}
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Enviar Email
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function CompanyInfoSkeleton({ variant }: { variant: string }) {
    if (variant === 'compact') {
        return (
            <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
                <Skeleton className="w-12 h-12 rounded" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 
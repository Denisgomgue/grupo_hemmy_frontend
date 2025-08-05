import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { Company, CompanyInfo, CreateCompanyDto, UpdateCompanyDto, LogoType } from '@/types/company/company';

// Query keys
const COMPANY_KEYS = {
    all: [ 'company' ] as const,
    info: () => [ ...COMPANY_KEYS.all, 'info' ] as const,
    list: () => [ ...COMPANY_KEYS.all, 'list' ] as const,
    detail: (id: number) => [ ...COMPANY_KEYS.all, 'detail', id ] as const,
    logos: (id: number) => [ ...COMPANY_KEYS.all, 'logos', id ] as const,
};

export const useCompany = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Obtener información de la empresa activa
    const {
        data: companyInfo,
        isLoading: isLoadingInfo,
        error: errorInfo,
        refetch: refetchInfo
    } = useQuery({
        queryKey: COMPANY_KEYS.info(),
        queryFn: async (): Promise<CompanyInfo> => {
            const response = await api.get('/company/info');
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutos
        cacheTime: 10 * 60 * 1000, // 10 minutos
    });

    // Obtener lista de empresas
    const {
        data: companies,
        isLoading: isLoadingList,
        error: errorList,
        refetch: refetchList
    } = useQuery({
        queryKey: COMPANY_KEYS.list(),
        queryFn: async (): Promise<Company[]> => {
            const response = await api.get('/company');
            return response.data;
        },
        enabled: false, // Solo se ejecuta cuando se llama manualmente
    });

    // Obtener empresa específica
    const useCompanyDetail = (id: number) => {
        return useQuery({
            queryKey: COMPANY_KEYS.detail(id),
            queryFn: async (): Promise<Company> => {
                const response = await api.get(`/company/${id}`);
                return response.data;
            },
            enabled: !!id,
        });
    };

    // Crear empresa
    const createCompanyMutation = useMutation({
        mutationFn: async (data: CreateCompanyDto): Promise<Company> => {
            const response = await api.post('/company', data);
            return response.data;
        },
        onSuccess: () => {
            toast({
                title: "Empresa creada",
                description: "La empresa se ha creado correctamente.",
                variant: "default",
            });
            queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.all });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "No se pudo crear la empresa.",
                variant: "destructive",
            });
        },
    });

    // Actualizar empresa
    const updateCompanyMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateCompanyDto }): Promise<Company> => {
            const response = await api.patch(`/company/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            toast({
                title: "Empresa actualizada",
                description: "La empresa se ha actualizado correctamente.",
                variant: "default",
            });
            queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.all });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "No se pudo actualizar la empresa.",
                variant: "destructive",
            });
        },
    });

    // Eliminar empresa
    const deleteCompanyMutation = useMutation({
        mutationFn: async (id: number): Promise<void> => {
            await api.delete(`/company/${id}`);
        },
        onSuccess: () => {
            toast({
                title: "Empresa eliminada",
                description: "La empresa se ha eliminado correctamente.",
                variant: "default",
            });
            queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.all });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "No se pudo eliminar la empresa.",
                variant: "destructive",
            });
        },
    });

    // Subir logo
    const uploadLogoMutation = useMutation({
        mutationFn: async ({ id, type, file }: { id: number; type: LogoType; file: File }): Promise<Company> => {
            const formData = new FormData();
            formData.append('logo', file);

            const response = await api.post(`/company/${id}/logo/${type}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
        onSuccess: () => {
            toast({
                title: "Logo subido",
                description: "El logo se ha subido correctamente.",
                variant: "default",
            });
            queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.all });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "No se pudo subir el logo.",
                variant: "destructive",
            });
        },
    });

    // Eliminar logo
    const removeLogoMutation = useMutation({
        mutationFn: async ({ id, type }: { id: number; type: LogoType }): Promise<Company> => {
            const response = await api.delete(`/company/${id}/logo/${type}`);
            return response.data;
        },
        onSuccess: () => {
            toast({
                title: "Logo eliminado",
                description: "El logo se ha eliminado correctamente.",
                variant: "default",
            });
            queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.all });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "No se pudo eliminar el logo.",
                variant: "destructive",
            });
        },
    });

    // Funciones de conveniencia
    const createCompany = useCallback((data: CreateCompanyDto) => {
        return createCompanyMutation.mutateAsync(data);
    }, [ createCompanyMutation ]);

    const updateCompany = useCallback((id: number, data: UpdateCompanyDto) => {
        return updateCompanyMutation.mutateAsync({ id, data });
    }, [ updateCompanyMutation ]);

    const deleteCompany = useCallback((id: number) => {
        return deleteCompanyMutation.mutateAsync(id);
    }, [ deleteCompanyMutation ]);

    const uploadLogo = useCallback((id: number, type: LogoType, file: File) => {
        return uploadLogoMutation.mutateAsync({ id, type, file });
    }, [ uploadLogoMutation ]);

    const removeLogo = useCallback((id: number, type: LogoType) => {
        return removeLogoMutation.mutateAsync({ id, type });
    }, [ removeLogoMutation ]);

    return {
        // Datos
        companyInfo,
        companies,

        // Estados de carga
        isLoadingInfo,
        isLoadingList,
        isLoadingCreate: createCompanyMutation.isPending,
        isLoadingUpdate: updateCompanyMutation.isPending,
        isLoadingDelete: deleteCompanyMutation.isPending,
        isLoadingUploadLogo: uploadLogoMutation.isPending,
        isLoadingRemoveLogo: removeLogoMutation.isPending,

        // Errores
        errorInfo,
        errorList,

        // Funciones
        createCompany,
        updateCompany,
        deleteCompany,
        uploadLogo,
        removeLogo,
        refetchInfo,
        refetchList,
        useCompanyDetail,
    };
}; 
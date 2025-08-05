import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { ResourcesAPI } from '@/services/resources-api';
import { Resource, CreateResourceData, UpdateResourceData } from '@/types/resources';

// Variables globales para el sistema de listeners (similar a payment)
let resourceList: Resource[] = [];
let listeners: (() => void)[] = [];

const notifyListeners = () => {
    listeners.forEach(listener => listener());
};

export const useResourcesAPI = () => {
    const [ resources, setResources ] = useState<Resource[]>(resourceList);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    // Cargar todos los recursos
    const loadResources = useCallback(async (activeOnly: boolean = false) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await ResourcesAPI.getAll(activeOnly);
            resourceList = data; // Actualizar variable global
            setResources(data);
            notifyListeners(); // Notificar a todos los listeners
            return data;
        } catch (err: any) {
            const message = err.response?.data?.message || 'Error al cargar los recursos';
            setError(message);
            toast.error(message);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Función de recarga (similar a refreshPayments en payment)
    const refreshResources = useCallback(async () => {
        return await loadResources();
    }, [ loadResources ]);

    // Cargar recursos al montar el componente
    useEffect(() => {
        loadResources();
    }, [ loadResources ]);

    // Crear nuevo recurso
    const createResource = useCallback(async (data: CreateResourceData): Promise<Resource> => {
        try {
            const newResource = await ResourcesAPI.create(data);

            // Actualizar variable global y notificar
            resourceList = [ ...resourceList, newResource ];
            setResources(resourceList);
            notifyListeners();

            toast.success('Recurso creado exitosamente');
            return newResource;
        } catch (err: any) {
            const message = err.response?.data?.message || 'Error al crear el recurso';
            toast.error(message);
            throw new Error(message);
        }
    }, []);

    // Actualizar recurso
    const updateResource = useCallback(async (id: number, data: UpdateResourceData): Promise<Resource> => {
        try {
            const updatedResource = await ResourcesAPI.update(id, data);

            // Actualizar variable global y notificar
            resourceList = resourceList.map(resource =>
                resource.id === id ? updatedResource : resource
            );
            setResources(resourceList);
            notifyListeners();

            toast.success('Recurso actualizado exitosamente');
            return updatedResource;
        } catch (err: any) {
            const message = err.response?.data?.message || 'Error al actualizar el recurso';
            toast.error(message);
            throw new Error(message);
        }
    }, []);

    // Eliminar recurso
    const deleteResource = useCallback(async (id: number): Promise<void> => {
        try {
            await ResourcesAPI.delete(id);

            // Actualizar variable global y notificar
            resourceList = resourceList.filter(resource => resource.id !== id);
            setResources(resourceList);
            notifyListeners();

            toast.success('Recurso eliminado exitosamente');
        } catch (err: any) {
            const message = err.response?.data?.message || 'Error al eliminar el recurso';
            toast.error(message);
            throw new Error(message);
        }
    }, []);

    // Activar/Desactivar recurso
    const toggleResourceActive = useCallback(async (id: number): Promise<Resource> => {
        try {
            const updatedResource = await ResourcesAPI.toggleActive(id);

            // Actualizar variable global y notificar
            resourceList = resourceList.map(resource =>
                resource.id === id ? updatedResource : resource
            );
            setResources(resourceList);
            notifyListeners();

            const status = updatedResource.isActive ? 'activado' : 'desactivado';
            toast.success(`Recurso ${status} exitosamente`);
            return updatedResource;
        } catch (err: any) {
            const message = err.response?.data?.message || 'Error al cambiar el estado del recurso';
            toast.error(message);
            throw new Error(message);
        }
    }, []);

    // Actualizar orden de recursos
    const updateResourcesOrder = useCallback(async (updates: { id: number; orderIndex: number }[]): Promise<Resource[]> => {
        try {
            const updatedResources = await ResourcesAPI.updateOrder(updates);

            // Actualizar variable global y notificar
            updatedResources.forEach((updatedResource: Resource) => {
                const index = resourceList.findIndex(r => r.id === updatedResource.id);
                if (index !== -1) {
                    resourceList[ index ] = updatedResource;
                }
            });
            setResources([ ...resourceList ]);
            notifyListeners();

            toast.success('Orden de recursos actualizado exitosamente');
            return updatedResources;
        } catch (err: any) {
            const message = err.response?.data?.message || 'Error al actualizar el orden de recursos';
            toast.error(message);
            throw new Error(message);
        }
    }, []);

    // Obtener recurso por ID
    const getResourceById = useCallback(async (id: number): Promise<Resource> => {
        try {
            return await ResourcesAPI.getById(id);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Error al obtener el recurso';
            toast.error(message);
            throw new Error(message);
        }
    }, []);

    // Obtener recurso por routeCode
    const getResourceByRouteCode = useCallback(async (routeCode: string): Promise<Resource> => {
        try {
            return await ResourcesAPI.getByRouteCode(routeCode);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Error al obtener el recurso';
            toast.error(message);
            throw new Error(message);
        }
    }, []);

    // Verificar si existe un routeCode
    const checkRouteCodeExists = useCallback((routeCode: string): boolean => {
        return resources.some(resource => resource.routeCode === routeCode);
    }, [ resources ]);

    // Verificar si existe un displayName
    const checkDisplayNameExists = useCallback((displayName: string): boolean => {
        return resources.some(resource => resource.displayName === displayName);
    }, [ resources ]);

    // Registrar listener para actualizaciones (similar a payment)
    useEffect(() => {
        const listener = () => setResources([ ...resourceList ]);
        listeners.push(listener);

        // Cargar datos iniciales si no hay datos
        if (resourceList.length === 0) {
            loadResources();
        }

        return () => {
            listeners = listeners.filter((l) => l !== listener);
        };
    }, [ loadResources ]);

    return {
        resources,
        isLoading,
        error,
        loadResources,
        refreshResources,
        createResource,
        updateResource,
        deleteResource,
        toggleResourceActive,
        updateResourcesOrder,
        getResourceById,
        getResourceByRouteCode,
        checkRouteCodeExists,
        checkDisplayNameExists,
    };
}; 
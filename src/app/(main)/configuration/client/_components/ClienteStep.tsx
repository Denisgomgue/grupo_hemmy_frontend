import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, AlertCircle, CheckCircle, Loader2, User, Info } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ClientFormData, AccountStatusEnum } from "@/schemas/client-schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";

interface ClienteStepProps {
    values: Partial<ClientFormData>;
    onChange: (field: keyof ClientFormData, value: any) => void;
    onValidationChange?: (isValid: boolean) => void;
    onExistingClientFound?: (client: any) => void; // Nueva prop para manejar cliente existente
    isEditMode?: boolean; // Nueva prop para modo edición
}

interface ValidationErrors {
    name?: string;
    lastName?: string;
    dni?: string;
    phone?: string;
    address?: string;
}

export default function ClienteStep({ values, onChange, onValidationChange, onExistingClientFound, isEditMode = false }: ClienteStepProps) {
    const [ errors, setErrors ] = useState<ValidationErrors>({});
    const [ touched, setTouched ] = useState<Record<string, boolean>>({});
    const [ isDniChecking, setIsDniChecking ] = useState(false);
    const [ isDniValid, setIsDniValid ] = useState(true);
    const [ existingClient, setExistingClient ] = useState<any>(null);
    const [ showExistingClientModal, setShowExistingClientModal ] = useState(false);

    // Función para formatear el teléfono
    const formatPhone = (value: string) => {
        // Remover todos los espacios y caracteres no numéricos
        const cleanValue = value.replace(/\D/g, '');

        // Limitar a 9 dígitos
        const limitedValue = cleanValue.slice(0, 9);

        // Formatear con espacios cada 3 dígitos
        let formatted = '';
        for (let i = 0; i < limitedValue.length; i++) {
            if (i > 0 && i % 3 === 0) {
                formatted += ' ';
            }
            formatted += limitedValue[ i ];
        }

        return formatted;
    };

    // Función para buscar cliente por DNI
    const searchClientByDni = async (dni: string): Promise<any> => {
        try {
            const response = await api.get(`/client/search-by-dni/${dni}`);
            return response.data;
        } catch (error) {
            console.error('Error al buscar cliente por DNI:', error);
            return null;
        }
    };

    // Función para validar DNI contra la base de datos
    const checkDniExists = async (dni: string): Promise<boolean> => {
        try {
            const response = await api.get(`/client/validate-dni/${dni}`);
            // El backend devuelve { valid: boolean, message: string }
            // valid = true significa que el DNI está disponible (no existe)
            // valid = false significa que el DNI ya está registrado (existe)
            return !response.data.valid; // Invertimos porque queremos saber si existe
        } catch (error) {
            console.error('Error al verificar DNI:', error);
            return false;
        }
    };

    // Función para validar DNI
    const validateDni = async (dni: string) => {
        const cleanDni = dni.replace(/\D/g, '');
        if (!cleanDni) return "El DNI es obligatorio";
        if (cleanDni.length < 8) return "El DNI debe tener 8 dígitos";
        if (cleanDni.length > 8) return "El DNI no puede tener más de 8 dígitos";

        // Si el DNI tiene 8 dígitos, verificar contra la base de datos
        if (cleanDni.length === 8) {
            setIsDniChecking(true);
            try {
                const exists = await checkDniExists(cleanDni);
                setIsDniChecking(false);
                if (exists) {
                    // Buscar información del cliente existente
                    const existingClientData = await searchClientByDni(cleanDni);
                    if (existingClientData) {
                        setExistingClient(existingClientData);
                        setShowExistingClientModal(true);
                        // No retornar error, el modal se encargará de la confirmación
                        return "";
                    }
                } else {
                    setIsDniValid(true);
                }
            } catch (error) {
                setIsDniChecking(false);
                setIsDniValid(true); // En caso de error, permitir continuar
            }
        }

        return "";
    };

    // Función para validar teléfono
    const validatePhone = (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        if (!cleanPhone) return "El teléfono es obligatorio";
        if (cleanPhone.length < 9) return "El teléfono debe tener al menos 9 dígitos";
        return "";
    };

    // Función para validar todos los campos
    const validateAllFields = async () => {
        const newErrors: ValidationErrors = {};

        // Validar nombres
        if (!values.name?.trim()) {
            newErrors.name = "Los nombres son obligatorios";
        }

        // Validar apellidos
        if (!values.lastName?.trim()) {
            newErrors.lastName = "Los apellidos son obligatorios";
        }

        // Validar DNI
        if (values.dni) {
            const dniError = await validateDni(values.dni);
            if (dniError) {
                newErrors.dni = dniError;
            }
        } else {
            newErrors.dni = "El DNI es obligatorio";
        }

        // Validar teléfono
        if (values.phone) {
            const phoneError = validatePhone(values.phone);
            if (phoneError) {
                newErrors.phone = phoneError;
            }
        } else {
            newErrors.phone = "El teléfono es obligatorio";
        }

        // Validar dirección
        if (!values.address?.trim()) {
            newErrors.address = "La dirección es obligatoria";
        }

        setErrors(newErrors);

        // Verificar si todos los campos son válidos
        const isValid = Object.keys(newErrors).length === 0 && isDniValid;
        onValidationChange?.(isValid);

        return isValid;
    };

    // Validar campos cuando cambien los valores
    useEffect(() => {
        const validateAsync = async () => {
            if (Object.keys(touched).length > 0) {
                await validateAllFields();
            }
        };

        validateAsync();
    }, [ values.name, values.lastName, values.dni, values.phone, values.address, isDniValid ]);

    // Manejar cambios en el DNI
    const handleDniChange = async (value: string) => {
        // Solo permitir números y limitar a 8 dígitos
        const cleanValue = value.replace(/\D/g, '').slice(0, 8);
        onChange("dni", cleanValue);
        setTouched(prev => ({ ...prev, dni: true }));

        // Si el DNI tiene 8 dígitos, validar contra la base de datos
        if (cleanValue.length === 8) {
            setIsDniChecking(true);
            try {
                const exists = await checkDniExists(cleanValue);
                setIsDniChecking(false);
                if (exists) {
                    // Buscar información del cliente existente
                    const existingClientData = await searchClientByDni(cleanValue);
                    if (existingClientData) {
                        setExistingClient(existingClientData);
                        setShowExistingClientModal(true);
                        // No marcar como inválido automáticamente, esperar la confirmación del usuario
                        // setIsDniValid(false);
                        // setErrors(prev => ({ ...prev, dni: "Este DNI ya está registrado" }));
                    }
                } else {
                    setIsDniValid(true);
                    setErrors(prev => ({ ...prev, dni: "" }));
                }
            } catch (error) {
                setIsDniChecking(false);
                setIsDniValid(true);
            }
        } else {
            setIsDniValid(true);
            setIsDniChecking(false);
        }
    };

    // Manejar cambios en el teléfono
    const handlePhoneChange = (value: string) => {
        const formatted = formatPhone(value);
        onChange("phone", formatted);
        setTouched(prev => ({ ...prev, phone: true }));
    };

    // Manejar blur de campos
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [ field ]: true }));
    };

    // Manejar confirmación de cliente existente
    // const handleExistingClientConfirm = () => {
    //     setShowExistingClientModal(false);
    //     // Limpiar el error del DNI ya que se va a usar el cliente existente
    //     setErrors(prev => ({ ...prev, dni: "" }));
    //     setIsDniValid(true);
    //     // Marcar el step como válido
    //     onValidationChange?.(true);
    //     if (onExistingClientFound && existingClient) {
    //         onExistingClientFound(existingClient);
    //     }
    // };

    // Manejar cancelación de cliente existente
    const handleExistingClientCancel = () => {
        setShowExistingClientModal(false);
        setExistingClient(null);
        // Limpiar el DNI para que el usuario pueda ingresar uno diferente
        onChange("dni", "");
        setIsDniValid(true);
        setErrors(prev => ({ ...prev, dni: "" }));
    };

    return (
        <>
            <div className="space-y-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">Información del Cliente</h3>
                    <p className="text-sm text-muted-foreground">
                        Complete los datos básicos del cliente
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Nombres */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-foreground">
                            Nombres <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="name"
                            placeholder="Ingrese los nombres"
                            value={values.name || ""}
                            onChange={(e) => onChange("name", e.target.value)}
                            onBlur={() => handleBlur("name")}
                            className={`w-full ${errors.name && touched.name ? "border-red-500" : ""}`}
                        />
                        {errors.name && touched.name && (
                            <div className="flex items-center gap-2 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {errors.name}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                            Apellidos <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="lastName"
                            placeholder="Ingrese los apellidos"
                            value={values.lastName || ""}
                            onChange={(e) => onChange("lastName", e.target.value)}
                            onBlur={() => handleBlur("lastName")}
                            className={`w-full ${errors.lastName && touched.lastName ? "border-red-500" : ""}`}
                        />
                        {errors.lastName && touched.lastName && (
                            <div className="flex items-center gap-2 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {errors.lastName}
                            </div>
                        )}
                    </div>

                    {/* DNI */}
                    <div className="space-y-2">
                        <label htmlFor="dni" className="text-sm font-medium text-foreground">
                            DNI <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Input
                                id="dni"
                                placeholder="12345678"
                                value={values.dni || ""}
                                onChange={(e) => handleDniChange(e.target.value)}
                                onBlur={() => handleBlur("dni")}
                                className={`w-full ${errors.dni && touched.dni ? "border-red-500" : ""} ${isDniValid && values.dni?.length === 8 ? "border-green-500" : ""}`}
                                maxLength={8}
                            />
                            {isDniChecking && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                </div>
                            )}
                            {!isDniChecking && values.dni?.length === 8 && isDniValid && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                </div>
                            )}
                        </div>
                        {errors.dni && touched.dni && (
                            <div className="flex items-center gap-2 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {errors.dni}
                            </div>
                        )}
                        {values.dni && values.dni.length < 8 && (
                            <div className="text-sm text-muted-foreground">
                                {values.dni.length}/8 dígitos
                            </div>
                        )}
                    </div>

                    {/* Teléfono */}
                    <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-foreground">
                            Teléfono <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="phone"
                            placeholder="987 654 321"
                            value={values.phone || ""}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            onBlur={() => handleBlur("phone")}
                            className={`w-full ${errors.phone && touched.phone ? "border-red-500" : ""}`}
                        />
                        {errors.phone && touched.phone && (
                            <div className="flex items-center gap-2 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {errors.phone}
                            </div>
                        )}

                    </div>

                    {/* Fecha de Nacimiento */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Fecha de Nacimiento
                        </label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {values.birthdate ? (
                                        format(new Date(values.birthdate), "PPP", { locale: es })
                                    ) : (
                                        <span>Seleccione una fecha</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    variant="birthdate"
                                    mode="single"
                                    selected={values.birthdate ? new Date(values.birthdate) : undefined}
                                    onSelect={(date) => onChange("birthdate", date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Dirección - Ancho completo */}
                    <div className="space-y-2">
                        <label htmlFor="address" className="text-sm font-medium text-foreground">
                            Dirección <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="address"
                            placeholder="Ingrese la dirección completa"
                            value={values.address || ""}
                            onChange={(e) => onChange("address", e.target.value)}
                            onBlur={() => handleBlur("address")}
                            className={`w-full ${errors.address && touched.address ? "border-red-500" : ""}`}
                        />
                        {errors.address && touched.address && (
                            <div className="flex items-center gap-2 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {errors.address}
                            </div>
                        )}
                    </div>

                    {/* Estado del Cliente */}
                    <div className="space-y-2">
                        <label htmlFor="status" className="text-sm font-medium text-foreground">
                            Estado del Cliente <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={values.status || "ACTIVE"}
                            onValueChange={(value) => onChange("status", value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccione el estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">Activo</SelectItem>
                                <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                                <SelectItem value="INACTIVE">Inactivo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Descripción - Ancho completo */}
                    <div className="space-y-2 md:col-span-2">
                        <label htmlFor="description" className="text-sm font-medium text-foreground">
                            Descripción
                        </label>
                        <Textarea
                            id="description"
                            placeholder="Información adicional del cliente (opcional)"
                            value={values.description || ""}
                            onChange={(e) => onChange("description", e.target.value)}
                            className="w-full"
                            rows={3}
                        />
                    </div>
                </div>
            </div>

            {/* Modal de cliente existente */}
            <Dialog open={showExistingClientModal} onOpenChange={setShowExistingClientModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-500" />
                            Cliente ya registrado
                        </DialogTitle>
                        <DialogDescription>
                            El DNI ingresado pertenece a un cliente que ya existe en el sistema.
                        </DialogDescription>
                    </DialogHeader>

                    {existingClient && (
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-blue-900">
                                            {existingClient.name} {existingClient.lastName}
                                        </h4>                                
                                    </div>
                                    <Badge variant={existingClient.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                        {existingClient.status === 'ACTIVE' ? 'Activo' :
                                            existingClient.status === 'SUSPENDED' ? 'Suspendido' : 'Inactivo'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                                    <div className="text-sm text-yellow-800">
                                        <p className="font-medium">Proximamente se podrá agregar una instalación a este cliente</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={handleExistingClientCancel}>
                            Cancelar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
} 
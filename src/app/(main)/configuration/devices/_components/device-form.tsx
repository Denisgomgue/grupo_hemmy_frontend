"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { deviceSchema, type DeviceFormData } from "@/schemas/device-schema"
import { Device, DeviceType, DeviceStatus, DeviceUseType, DEVICE_TYPES, DEVICE_STATUS, DEVICE_USE_TYPES } from "@/types/devices/device"
import { useEffect, useCallback } from "react"

interface DeviceFormProps {
    device?: Device | null
    onSubmit: (values: DeviceFormData) => void
    isLoading?: boolean
    onCancel: () => void
    formRef?: React.RefObject<HTMLFormElement | null>
    onFormReady?: (form: any) => void
}

export function DeviceForm({ device, onSubmit, isLoading = false, onCancel, formRef, onFormReady }: DeviceFormProps) {
    const form = useForm<DeviceFormData>({
        resolver: zodResolver(deviceSchema),
        defaultValues: {
            serialNumber: "",
            type: "router" as DeviceType,
            status: "STOCK" as DeviceStatus,
            useType: "CLIENT" as DeviceUseType,
            brand: "",
            model: "",
            macAddress: "",
            notes: "",
            assignedInstallationId: undefined,
            assignedEmployeeId: undefined,
            assignedClientId: undefined,
            ...(device ? {
                serialNumber: device.serialNumber || "",
                type: device.type || "router",
                status: device.status || "STOCK",
                useType: device.useType || "CLIENT",
                brand: device.brand || "",
                model: device.model || "",
                macAddress: device.macAddress || "",
                notes: device.notes || "",
                assignedInstallationId: device.assignedInstallationId,
                assignedEmployeeId: device.assignedEmployeeId,
                assignedClientId: device.assignedClientId,
            } : {})
        },
    })

    useEffect(() => {
        if (device) {
            form.reset({
                serialNumber: device.serialNumber || "",
                type: device.type || "router",
                status: device.status || "STOCK",
                useType: device.useType || "CLIENT",
                brand: device.brand || "",
                model: device.model || "",
                macAddress: device.macAddress || "",
                notes: device.notes || "",
                assignedInstallationId: device.assignedInstallationId,
                assignedEmployeeId: device.assignedEmployeeId,
                assignedClientId: device.assignedClientId,
            })
        }
    }, [ device, form ])

    useEffect(() => {
        if (onFormReady) {
            onFormReady(form);
        }
    }, [ form, onFormReady ]);

    const handleSubmit = async (values: DeviceFormData) => {
        await onSubmit(values)
    }

    const getTypeLabel = (type: DeviceType) => {
        const typeLabels: Record<DeviceType, string> = {
            router: "Router",
            deco: "Deco",
            ont: "ONT",
            switch: "Switch",
            laptop: "Laptop",
            crimpadora: "Crimpadora",
            tester: "Tester",
            antena: "Antena",
            fibra: "Fibra",
            conector: "Conector",
            otro: "Otro"
        }
        return typeLabels[ type ] || type
    }

    const getStatusLabel = (status: DeviceStatus) => {
        const statusLabels: Record<DeviceStatus, string> = {
            STOCK: "En Stock",
            ASSIGNED: "Asignado",
            SOLD: "Vendido",
            MAINTENANCE: "Mantenimiento",
            LOST: "Perdido",
            USED: "Usado"
        }
        return statusLabels[ status ] || status
    }

    const getUseTypeLabel = (useType: DeviceUseType) => {
        const useTypeLabels: Record<DeviceUseType, string> = {
            CLIENT: "Cliente",
            EMPLOYEE: "Empleado",
            COMPANY: "Empresa",
            CONSUMABLE: "Consumible"
        }
        return useTypeLabels[ useType ] || useType
    }

    return (
        <Form {...form}>
            <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="serialNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número de Serie *</FormLabel>
                                <FormControl>
                                    <Input
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        disabled={isLoading}
                                        placeholder="Ingrese el número de serie"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Marca</FormLabel>
                                <FormControl>
                                    <Input
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        disabled={isLoading}
                                        placeholder="Ej: TP-Link, Huawei"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoading}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {DEVICE_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>{getTypeLabel(type)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="useType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Uso *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoading}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar tipo de uso" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {DEVICE_USE_TYPES.map((useType) => (
                                            <SelectItem key={useType} value={useType}>{getUseTypeLabel(useType)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="macAddress"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>MAC Address</FormLabel>
                                <FormControl>
                                    <Input
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        disabled={isLoading}
                                        placeholder="00:11:22:33:44:55"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Modelo</FormLabel>
                                <FormControl>
                                    <Input
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        disabled={isLoading}
                                        placeholder="Ej: Archer C7, HG8245H"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notas</FormLabel>
                            <FormControl>
                                <Input
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    disabled={isLoading}
                                    placeholder="Información adicional sobre el dispositivo"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />


            </form>
        </Form>
    )
} 
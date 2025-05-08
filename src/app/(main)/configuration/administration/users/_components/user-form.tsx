"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle } from "lucide-react"
import useSWR from "swr"
import { Profile } from "@/types/profiles/profile"
import api from "@/lib/axios"
import { formSchema } from "@/schemas/user-schema"

const fetcher = (url: string) => api.get(url).then((res) => res.data)

const ErrorMessage = ({ message }: { message: string }) => (
    <div className="fixed z-50">
        <div className="fixed mt-[-80px] bg-white rounded-md p-2 text-xs border border-gray-200 animate-[slideIn_0.3s_ease-out]">
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                <span className="text-gray-900">{message}</span>
            </div>
            <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-b border-r border-gray-200 transform rotate-45"></div>
        </div>
    </div>
);

export function UserForm({
    onSubmit,
    onCancel,
}: {
    onSubmit: (values: z.infer<typeof formSchema>) => void
    onCancel: () => void
}) {
    const [isMounted, setIsMounted] = useState(false)
    const { data: profiles, error, isLoading: profilesLoading, mutate } = useSWR<Profile[]>("/roles", fetcher)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            surname: "",
            email: "",
            phone: "",
            roleId: undefined,
            documentNumber: "",
            documentType: "",
            username: "",
            password: "",
            confirmPassword: "",
        },
    })

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid grid-cols-2">
                        <TabsTrigger value="personal" className="flex-1">
                            Información Personal
                        </TabsTrigger>
                        <TabsTrigger value="account" className="flex-1">
                            Cuenta
                        </TabsTrigger>
                    </TabsList>
                    <div className="mt-4 h-auto overflow-y-auto">
                        <TabsContent value="personal" className="space-y-6 px-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="relative">
                                            <FormLabel>Nombres</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John" {...field} />
                                            </FormControl>
                                            {form.formState.errors.name && (
                                                <ErrorMessage message={form.formState.errors.name.message!} />
                                            )}
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="surname"
                                    render={({ field }) => (
                                        <FormItem className="relative">
                                            <FormLabel>Apellidos</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} />
                                            </FormControl>
                                            {form.formState.errors.surname && (
                                                <ErrorMessage message={form.formState.errors.surname.message!} />
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="documentType"
                                    render={({ field }) => (
                                        <FormItem className="relative">
                                            <FormLabel>Tipo de Documento</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione tipo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="DNI">DNI</SelectItem>
                                                    <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                                                    <SelectItem value="OTHER">Otro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {form.formState.errors.documentType && (
                                                <ErrorMessage message={form.formState.errors.documentType.message!} />
                                            )}
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="documentNumber"
                                    render={({ field }) => (
                                        <FormItem className="relative">
                                            <FormLabel>Número de Documento</FormLabel>
                                            <FormControl>
                                                <Input placeholder="12345678" {...field} />
                                            </FormControl>
                                            {form.formState.errors.documentNumber && (
                                                <ErrorMessage message={form.formState.errors.documentNumber.message!} />
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem className="relative">
                                            <FormLabel>Número de Celular</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+51 999999999" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="roleId"
                                    render={({ field }) => (
                                        <FormItem className="relative">
                                            <FormLabel>Perfil</FormLabel>
                                            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione un perfil" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {profiles?.map((profile) => (
                                                        <SelectItem key={profile.id} value={profile.id.toString()}>
                                                            {profile.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {form.formState.errors.roleId && <ErrorMessage message={form.formState.errors.roleId.message!} />}
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="account" className="space-y-6  px-4 py-2">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem className="relative">
                                        <FormLabel>Nombre de Usuario</FormLabel>
                                        <FormControl>
                                            <Input placeholder="johndoe123" {...field} />
                                        </FormControl>
                                        {form.formState.errors.username && (
                                            <ErrorMessage message={form.formState.errors.username.message!} />
                                        )}
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="relative">
                                        <FormLabel>Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <Input placeholder="johndoe@example.com" {...field} />
                                        </FormControl>
                                        {form.formState.errors.email && <ErrorMessage message={form.formState.errors.email.message!} />}
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="relative">
                                            <FormLabel>Contraseña</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            {form.formState.errors.password && (
                                                <ErrorMessage message={form.formState.errors.password.message!} />
                                            )}
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem className="relative">
                                            <FormLabel>Verificar Contraseña</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            {form.formState.errors.confirmPassword && (
                                                <ErrorMessage message={form.formState.errors.confirmPassword.message!} />
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit">Crear Usuario</Button>
                </div>
            </form>
        </Form>
    )
}
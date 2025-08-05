import { z } from 'zod';

export const InstallationSchema = z.object({
    id: z.number().optional(),
    clientId: z.number({ required_error: "* El cliente es requerido" }),
    installationDate: z.date({ required_error: "* La fecha de instalación es requerida" }),
    reference: z.string().optional().or(z.literal('')),
    ipAddress: z.string().optional().or(z.literal('')),
    referenceImage: z.string().optional().or(z.literal('')),
    planId: z.number({ required_error: "* El plan es requerido" }),
    sectorId: z.number({ required_error: "* El sector es requerido" }),
});

export const UpdateInstallationSchema = InstallationSchema.partial();

export type InstallationFormData = z.infer<typeof InstallationSchema>;
export type UpdateInstallationFormData = z.infer<typeof UpdateInstallationSchema>; 
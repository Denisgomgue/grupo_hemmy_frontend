export interface ModuleConfig {
    id: string;
    name: string;
    icon: string;
    basePermissions: string[];
    specificPermissions: PermissionConfig[];
    components: ComponentConfig;
}

export interface PermissionConfig {
    id: string;
    name: string;
    description: string;
    category: 'CRUD' | 'UI' | 'ACTION' | 'SPECIAL';
}

export interface ComponentConfig {
    summary?: string;
    table: string;
    filters?: string;
    actions?: string[];
    modals?: string[];
    tabs?: string[];
}

export const MODULE_CONFIG: Record<string, ModuleConfig> = {
    payments: {
        id: 'payments',
        name: 'Pagos',
        icon: '💳',
        basePermissions: [ 'CREATE', 'READ', 'UPDATE', 'DELETE', 'VIEW_SUMMARY_CARDS' ],
        specificPermissions: [
            {
                id: 'VOID_PAYMENT',
                name: 'Anular Pago',
                description: 'Permite anular pagos realizados',
                category: 'ACTION'
            },
            {
                id: 'APPROVE_PAYMENT',
                name: 'Aprobar Pago',
                description: 'Permite aprobar pagos pendientes',
                category: 'ACTION'
            },
            {
                id: 'GENERATE_RECEIPT',
                name: 'Generar Recibo',
                description: 'Permite generar recibos de pago',
                category: 'ACTION'
            },
            {
                id: 'BULK_IMPORT',
                name: 'Importar Pagos',
                description: 'Permite importar pagos masivos',
                category: 'SPECIAL'
            },
            {
                id: 'ADVANCE_PAYMENT',
                name: 'Pago Anticipado',
                description: 'Permite registrar pagos anticipados',
                category: 'SPECIAL'
            }
        ],
        components: {
            summary: 'PaymentSummaryCards',
            table: 'PaymentsTable',
            filters: 'PaymentFilters',
            actions: [ 'void-payment', 'bulk-import', 'generate-receipt', 'advance-payment' ],
            modals: [ 'VoidPaymentModal', 'BulkImportModal', 'AdvancePaymentModal' ],
            tabs: [ 'all', 'pending', 'approved', 'voided' ]
        }
    },

    clients: {
        id: 'clients',
        name: 'Clientes',
        icon: '👥',
        basePermissions: [ 'CREATE', 'READ', 'UPDATE', 'DELETE', 'VIEW_SUMMARY_CARDS' ],
        specificPermissions: [
            {
                id: 'SEND_NOTIFICATION',
                name: 'Enviar Notificación',
                description: 'Permite enviar notificaciones a clientes',
                category: 'ACTION'
            },
            {
                id: 'VIEW_INSTALLATIONS',
                name: 'Ver Instalaciones',
                description: 'Permite ver instalaciones del cliente',
                category: 'UI'
            },
            {
                id: 'MANAGE_CONTRACTS',
                name: 'Gestionar Contratos',
                description: 'Permite gestionar contratos de clientes',
                category: 'SPECIAL'
            },
            {
                id: 'CLIENT_ACTIVATION',
                name: 'Activar Cliente',
                description: 'Permite activar/desactivar clientes',
                category: 'ACTION'
            }
        ],
        components: {
            summary: 'ClientSummaryCards',
            table: 'ClientsTable',
            filters: 'ClientFilters',
            actions: [ 'send-notification', 'view-installations', 'manage-contracts' ],
            modals: [ 'SendNotificationModal', 'ClientActivationModal' ],
            tabs: [ 'all', 'active', 'inactive', 'suspended' ]
        }
    },

    installations: {
        id: 'installations',
        name: 'Instalaciones',
        icon: '🏠',
        basePermissions: [ 'CREATE', 'READ', 'UPDATE', 'DELETE', 'VIEW_SUMMARY_CARDS' ],
        specificPermissions: [
            {
                id: 'SCHEDULE_INSTALLATION',
                name: 'Programar Instalación',
                description: 'Permite programar instalaciones',
                category: 'ACTION'
            },
            {
                id: 'MANAGE_TECHNICIANS',
                name: 'Gestionar Técnicos',
                description: 'Permite asignar técnicos a instalaciones',
                category: 'SPECIAL'
            },
            {
                id: 'VIEW_MAPS',
                name: 'Ver Mapas',
                description: 'Permite ver ubicaciones en mapas',
                category: 'UI'
            }
        ],
        components: {
            summary: 'InstallationSummaryCards',
            table: 'InstallationsTable',
            filters: 'InstallationFilters',
            actions: [ 'schedule-installation', 'manage-technicians' ],
            modals: [ 'ScheduleInstallationModal', 'TechnicianAssignmentModal' ],
            tabs: [ 'all', 'scheduled', 'in-progress', 'completed' ]
        }
    },

    reports: {
        id: 'reports',
        name: 'Reportes',
        icon: '📊',
        basePermissions: [ 'READ', 'VIEW_SUMMARY_CARDS' ],
        specificPermissions: [
            {
                id: 'GENERATE_REPORTS',
                name: 'Generar Reportes',
                description: 'Permite generar reportes',
                category: 'ACTION'
            },
            {
                id: 'EXPORT_PDF',
                name: 'Exportar PDF',
                description: 'Permite exportar reportes en PDF',
                category: 'ACTION'
            },
            {
                id: 'EXPORT_EXCEL',
                name: 'Exportar Excel',
                description: 'Permite exportar reportes en Excel',
                category: 'ACTION'
            },
            {
                id: 'SCHEDULE_REPORTS',
                name: 'Programar Reportes',
                description: 'Permite programar reportes automáticos',
                category: 'SPECIAL'
            }
        ],
        components: {
            summary: 'ReportSummaryCards',
            table: 'ReportsTable',
            filters: 'ReportFilters',
            actions: [ 'generate-report', 'export-pdf', 'export-excel' ],
            modals: [ 'GenerateReportModal', 'ScheduleReportModal' ],
            tabs: [ 'financial', 'technical', 'operational' ]
        }
    }
};

// Datos ficticios de roles
export const ROLES = [
    {
        id: 1,
        name: 'Administrador',
        description: 'Acceso completo al sistema',
        color: 'purple'
    },
    {
        id: 2,
        name: 'Supervisor',
        description: 'Gestión de operaciones',
        color: 'blue'
    },
    {
        id: 3,
        name: 'Operador',
        description: 'Operaciones básicas',
        color: 'green'
    },
    {
        id: 4,
        name: 'Técnico',
        description: 'Instalaciones y mantenimiento',
        color: 'orange'
    },
    {
        id: 5,
        name: 'Contador',
        description: 'Reportes financieros',
        color: 'red'
    }
];

// Permisos por defecto para cada rol
export const DEFAULT_ROLE_PERMISSIONS = {
    'Administrador': {
        payments: [ 'CREATE', 'READ', 'UPDATE', 'DELETE', 'VIEW_SUMMARY_CARDS', 'VOID_PAYMENT', 'APPROVE_PAYMENT', 'GENERATE_RECEIPT', 'BULK_IMPORT', 'ADVANCE_PAYMENT' ],
        clients: [ 'CREATE', 'READ', 'UPDATE', 'DELETE', 'VIEW_SUMMARY_CARDS', 'SEND_NOTIFICATION', 'VIEW_INSTALLATIONS', 'MANAGE_CONTRACTS', 'CLIENT_ACTIVATION' ],
        installations: [ 'CREATE', 'READ', 'UPDATE', 'DELETE', 'VIEW_SUMMARY_CARDS', 'SCHEDULE_INSTALLATION', 'MANAGE_TECHNICIANS', 'VIEW_MAPS' ],
        reports: [ 'READ', 'VIEW_SUMMARY_CARDS', 'GENERATE_REPORTS', 'EXPORT_PDF', 'EXPORT_EXCEL', 'SCHEDULE_REPORTS' ]
    },
    'Supervisor': {
        payments: [ 'CREATE', 'READ', 'UPDATE', 'VIEW_SUMMARY_CARDS', 'VOID_PAYMENT', 'APPROVE_PAYMENT', 'GENERATE_RECEIPT' ],
        clients: [ 'CREATE', 'READ', 'UPDATE', 'VIEW_SUMMARY_CARDS', 'SEND_NOTIFICATION', 'VIEW_INSTALLATIONS' ],
        installations: [ 'CREATE', 'READ', 'UPDATE', 'VIEW_SUMMARY_CARDS', 'SCHEDULE_INSTALLATION' ],
        reports: [ 'READ', 'VIEW_SUMMARY_CARDS', 'GENERATE_REPORTS', 'EXPORT_PDF' ]
    },
    'Operador': {
        payments: [ 'READ', 'VIEW_SUMMARY_CARDS' ],
        clients: [ 'READ', 'VIEW_SUMMARY_CARDS' ],
        installations: [ 'READ', 'VIEW_SUMMARY_CARDS' ],
        reports: [ 'READ' ]
    },
    'Técnico': {
        payments: [ 'READ' ],
        clients: [ 'READ' ],
        installations: [ 'READ', 'UPDATE', 'VIEW_SUMMARY_CARDS', 'VIEW_MAPS' ],
        reports: [ 'READ' ]
    },
    'Contador': {
        payments: [ 'READ', 'VIEW_SUMMARY_CARDS' ],
        clients: [ 'READ', 'VIEW_SUMMARY_CARDS' ],
        installations: [ 'READ' ],
        reports: [ 'READ', 'VIEW_SUMMARY_CARDS', 'GENERATE_REPORTS', 'EXPORT_PDF', 'EXPORT_EXCEL' ]
    }
}; 
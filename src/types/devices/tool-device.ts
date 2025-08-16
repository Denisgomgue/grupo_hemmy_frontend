// Tipos para herramientas de instalación que no tienen número de serie ni MAC address
export enum ToolType {
    ALICATES = 'alicates',
    MARTILLO = 'martillo',
    DESTORNILLADOR = 'destornillador',
    CUTTER = 'cutter',
    CINTA_METRICA = 'cinta_metrica',
    MULTIMETRO = 'multimetro',
    CRIMPADORA = 'crimpadora',
    TESTER = 'tester',
    OTRO = 'otro'
}

export enum ToolStatus {
    AVAILABLE = 'AVAILABLE',      // Disponible
    IN_USE = 'IN_USE',           // En uso
    MAINTENANCE = 'MAINTENANCE',  // En mantenimiento
    DAMAGED = 'DAMAGED',         // Dañado
    LOST = 'LOST',               // Perdido
    RETIRED = 'RETIRED'          // Retirado
}

export enum ToolCategory {
    ELECTRICAL = 'ELECTRICAL',   // Herramientas eléctricas
    MANUAL = 'MANUAL',           // Herramientas manuales
    MEASUREMENT = 'MEASUREMENT', // Herramientas de medición
    NETWORK = 'NETWORK',         // Herramientas de red
    SAFETY = 'SAFETY'            // Equipos de seguridad
}

export interface Tool {
    id: number;
    name: string;                    // Nombre de la herramienta
    type: ToolType;                  // Tipo de herramienta
    category: ToolCategory;          // Categoría
    status: ToolStatus;              // Estado actual
    brand?: string;                  // Marca (opcional)
    model?: string;                  // Modelo (opcional)
    description?: string;            // Descripción detallada
    location?: string;               // Ubicación física
    assignedEmployeeId?: number;     // Empleado asignado
    assignedDate?: Date;             // Fecha de asignación
    returnDate?: Date;               // Fecha de devolución esperada
    notes?: string;                  // Notas adicionales
    purchaseDate?: Date;             // Fecha de compra
    warrantyExpiry?: Date;           // Vencimiento de garantía
    lastMaintenance?: Date;          // Último mantenimiento
    nextMaintenance?: Date;          // Próximo mantenimiento programado
    created_at: Date;
    updated_at: Date;
}

export interface CreateToolDto {
    name: string;
    type: ToolType;
    category: ToolCategory;
    status: ToolStatus;
    brand?: string;
    model?: string;
    description?: string;
    location?: string;
    notes?: string;
    purchaseDate?: string;
    warrantyExpiry?: string;
}

export interface UpdateToolDto extends Partial<CreateToolDto> {
    assignedEmployeeId?: number;
    assignedDate?: string;
    returnDate?: string;
    lastMaintenance?: string;
    nextMaintenance?: string;
}

// Esquema de validación para herramientas
export const toolSchema = {
    name: "string|min:1",
    type: "string|in:" + Object.values(ToolType).join(','),
    category: "string|in:" + Object.values(ToolCategory).join(','),
    status: "string|in:" + Object.values(ToolStatus).join(','),
    brand: "string|optional",
    model: "string|optional",
    description: "string|optional",
    location: "string|optional",
    notes: "string|optional",
    purchaseDate: "date|optional",
    warrantyExpiry: "date|optional"
};

// Ejemplos de uso:
/*
// Crear una nueva herramienta
const newTool: CreateToolDto = {
    name: "Alicates de Corte",
    type: ToolType.ALICATES,
    category: ToolCategory.MANUAL,
    status: ToolStatus.AVAILABLE,
    brand: "Stanley",
    description: "Alicates de corte para cables de hasta 10mm",
    location: "Almacén Principal - Estante A1"
};

// Asignar herramienta a empleado
const toolAssignment: UpdateToolDto = {
    status: ToolStatus.IN_USE,
    assignedEmployeeId: 123,
    assignedDate: "2025-01-15",
    returnDate: "2025-01-20"
};

// Registrar mantenimiento
const maintenanceUpdate: UpdateToolDto = {
    status: ToolStatus.MAINTENANCE,
    lastMaintenance: "2025-01-15",
    nextMaintenance: "2025-04-15"
};
*/

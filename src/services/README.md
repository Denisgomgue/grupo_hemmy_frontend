# Servicios de API - Grupo Hemmy Frontend

## 📋 **Descripción General**

Esta carpeta contiene todos los servicios de API del frontend, organizados de manera consistente y siguiendo las mejores prácticas. Cada servicio maneja la comunicación HTTP con el backend para un módulo específico.

## 🏗️ **Estructura de Servicios**

### **Servicios Disponibles:**

1. **`payments-api.ts`** - Gestión de pagos
2. **`clients-api.ts`** - Gestión de clientes
3. **`devices-api.ts`** - Gestión de dispositivos
4. **`employees-api.ts`** - Gestión de empleados
5. **`installations-api.ts`** - Gestión de instalaciones
6. **`plans-api.ts`** - Gestión de planes
7. **`sectors-api.ts`** - Gestión de sectores
8. **`services-api.ts`** - Gestión de servicios
9. **`roles-api.ts`** - Gestión de roles
10. **`users-api.ts`** - Gestión de usuarios
11. **`company-api.ts`** - Gestión de empresas
12. **`client-payment-config-api.ts`** - Configuración de pagos de clientes
13. **`permissions-api.ts`** - Gestión de permisos
14. **`resources-api.ts`** - Gestión de recursos

## 🔧 **Patrón de Implementación**

Cada servicio sigue el mismo patrón:

```typescript
export class ModuleAPI {
  // Obtener todos los elementos
  static async getAll(params?: any): Promise<{ data: Type[]; total: number }> {
    const response = await axios.get("/endpoint", { params });
    return response.data;
  }

  // Obtener por ID
  static async getById(id: number): Promise<Type> {
    const response = await axios.get(`/endpoint/${id}`);
    return response.data;
  }

  // Crear nuevo elemento
  static async create(data: CreateType): Promise<Type> {
    const response = await axios.post("/endpoint", data);
    return response.data;
  }

  // Actualizar elemento
  static async update(id: number, data: UpdateType): Promise<Type> {
    const response = await axios.patch(`/endpoint/${id}`, data);
    return response.data;
  }

  // Eliminar elemento
  static async delete(id: number): Promise<void> {
    await axios.delete(`/endpoint/${id}`);
  }
}
```

## 🎯 **Ventajas de esta Estructura**

### **1. Separación de Responsabilidades**

- **Servicios**: Manejan solo la comunicación HTTP
- **Hooks**: Manejan el estado de React y efectos
- **Componentes**: Se enfocan en la UI

### **2. Reutilización**

- Los servicios pueden ser usados en múltiples hooks
- Fácil testing de la lógica de API
- Consistencia en el manejo de errores

### **3. Mantenibilidad**

- Código más organizado y fácil de entender
- Cambios en la API se centralizan en un lugar
- Fácil debugging

### **4. Testing**

- Los servicios pueden ser mockeados fácilmente
- Testing unitario más sencillo
- Mejor cobertura de código

## 📝 **Uso en Hooks**

### **Antes (Inconsistente):**

```typescript
// Hook con lógica de API mezclada
export function usePayments() {
  const refreshPayments = useCallback(async () => {
    const response = await axios.get("/payments");
    // Lógica de manejo de respuesta...
  }, []);
}
```

### **Después (Consistente):**

```typescript
// Hook que usa el servicio
export function usePayments() {
  const refreshPayments = useCallback(async () => {
    const response = await PaymentsAPI.getAll();
    // Solo lógica de estado de React...
  }, []);
}
```

## 🔄 **Migración de Hooks Existentes**

Los hooks existentes han sido refactorizados para usar los nuevos servicios:

### **✅ Hooks Refactorizados:**

- `use-payment.ts` → Usa `PaymentsAPI`
- `use-client.ts` → Usa `ClientsAPI`
- `use-permissions-api.ts` → Usa `PermissionsAPI`

### **✅ Hooks Nuevos Creados:**

- `use-devices-api.ts` → Usa `DevicesAPI`
- `use-employees-api.ts` → Usa `EmployeesAPI`
- `use-installations-api.ts` → Usa `InstallationsAPI`
- `use-plans-api.ts` → Usa `PlansAPI`
- `use-sectors-api.ts` → Usa `SectorsAPI`
- `use-services-api.ts` → Usa `ServicesAPI`
- `use-roles-api.ts` → Usa `RolesAPI`
- `use-users-api.ts` → Usa `UsersAPI`
- `use-company-api.ts` → Usa `CompanyAPI`
- `use-client-payment-config-api.ts` → Usa `ClientPaymentConfigAPI`

## 📦 **Exportaciones**

Todos los servicios se exportan desde `index.ts`:

```typescript
// Exportar servicios
export { PaymentsAPI } from "./payments-api";
export { ClientsAPI } from "./clients-api";
// ... más servicios

// Exportar tipos
export type { PaymentSummary, CreatePaymentData } from "./payments-api";
export type { ClientSummary, CreateClientData } from "./clients-api";
// ... más tipos
```

## 🎯 **Patrón de Hooks**

Todos los hooks siguen el mismo patrón:

```typescript
export function useModuleAPI() {
  const [data, setData] = useState<Type[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const loadData = useCallback(async (params?: any) => {
    setIsLoading(true);
    try {
      const response = await ModuleAPI.getAll(params);
      setData(response.data);
      return response;
    } catch (error) {
      console.error("Error loading data:", error);
      return { data: [], total: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createItem = useCallback(
    async (data: any) => {
      try {
        const response = await ModuleAPI.create(data);
        await loadData();
        return response;
      } catch (error) {
        console.error("Error creating item:", error);
        throw error;
      }
    },
    [loadData]
  );

  // ... más métodos CRUD

  useEffect(() => {
    loadData();
    getSummary();
  }, [loadData, getSummary]);

  return {
    data,
    isLoading,
    summary,
    loadData,
    createItem,
    // ... más métodos
  };
}
```

## 🚀 **Próximos Pasos**

1. **✅ Completar migración**: Refactorizar hooks restantes
2. **Testing**: Agregar tests unitarios para servicios
3. **Documentación**: Documentar endpoints específicos
4. **Optimización**: Implementar cache y optimizaciones

## 📚 **Referencias**

- [Axios Documentation](https://axios-http.com/)
- [React Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [TypeScript API Patterns](https://www.typescriptlang.org/docs/)

## 🎉 **Estado del Proyecto**

### **✅ Completado:**

- ✅ 14 servicios de API creados
- ✅ 11 hooks refactorizados/creados
- ✅ Estructura consistente implementada
- ✅ Documentación actualizada
- ✅ Separación de responsabilidades lograda

### **🔄 En Progreso:**

- 🔄 Testing unitario
- 🔄 Optimizaciones de rendimiento

### **📋 Pendiente:**

- 📋 Documentación de endpoints específicos
- 📋 Implementación de cache
- 📋 Monitoreo de errores

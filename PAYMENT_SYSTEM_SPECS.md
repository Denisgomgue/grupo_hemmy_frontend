# Sistema de Pagos con Compromiso de Fecha - Especificaciones Técnicas

## 📋 **Resumen del Sistema**

Este sistema maneja dos tipos de estados:

1. **Estados de Pago** (tabla `payments`)
2. **Estados de Configuración del Cliente** (tabla `client_payment_config`)

## 🔄 **Flujo de Trabajo Completo**

### **1. Pago Normal (Automático)**

```
Cliente registra pago → Sistema calcula automáticamente:
├── Si paymentDate ≤ dueDate → PAGO_AL_DIA
└── Si paymentDate > dueDate → ATRASADO
```

### **2. Pago Pendiente (Manual)**

```
Usuario selecciona PENDIENTE → Establece engagementDate:
├── Cliente paga antes de engagementDate → Confirmar → LATE_PAYMENT
└── Cliente no paga en engagementDate → client_payment_config.status = SUSPENDED
```

### **3. Confirmación de Pago Pendiente**

```
Pago PENDIENTE → Botón "Confirmar Pago" →
├── paymentDate = fecha actual
├── payment.status = LATE_PAYMENT
└── client_payment_config.status = PAID
```

## 📊 **Estados Disponibles**

### **Estados de Pago (payments.status)**

- **PENDING**: Pago esperando ser realizado
- **PAYMENT_DAILY**: Pago realizado a tiempo
- **LATE_PAYMENT**: Pago realizado fuera de plazo
- **VOIDED**: Pago cancelado

### **Estados de Configuración (client_payment_config.status)**

- **PAID**: Cliente al día con sus pagos
- **SUSPENDED**: Cliente suspendido por falta de pago
- **EXPIRED**: Cliente con pago vencido
- **EXPIRING**: Cliente por vencer

## 🎯 **Casos de Uso Específicos**

### **Caso 1: Pago Normal**

1. Usuario registra pago con fecha de pago
2. Sistema calcula automáticamente:
   - Si fecha ≤ dueDate → PAYMENT_DAILY
   - Si fecha > dueDate → LATE_PAYMENT

### **Caso 2: Pago Pendiente**

1. Usuario selecciona estado "PENDIENTE"
2. Aparece campo "Fecha de Compromiso"
3. Usuario establece engagementDate
4. Sistema guarda como PENDING

### **Caso 3: Cliente no paga en fecha de compromiso**

1. Sistema detecta que engagementDate < fecha actual
2. Sistema actualiza client_payment_config.status = SUSPENDED
3. Pago sigue como PENDING hasta confirmación

### **Caso 4: Confirmación de pago pendiente**

1. Usuario hace clic en "Confirmar Pago"
2. Sistema actualiza:
   - payment.paymentDate = fecha actual
   - payment.status = LATE_PAYMENT
   - client_payment_config.status = PAID

## 🔧 **Implementación Técnica**

### **Frontend (Completado)**

- ✅ Formulario con selector de estado
- ✅ Campo de fecha de compromiso
- ✅ Botón de confirmar pago pendiente
- ✅ Cálculo automático de estados
- ✅ Validaciones y UI

### **Backend (Pendiente)**

- ⏳ API para actualizar client_payment_config
- ⏳ Lógica de suspensión automática
- ⏳ Endpoint para confirmar pagos pendientes
- ⏳ Validaciones de negocio

## 🚨 **Consideraciones Importantes**

### **1. Sincronización de Estados**

- Los estados de `payments` y `client_payment_config` deben estar sincronizados
- Cambios en un pago pueden afectar el estado del cliente

### **2. Validaciones de Negocio**

- No se puede confirmar un pago pendiente antes de la fecha de compromiso
- Un cliente suspendido no puede tener pagos PAGO_AL_DIA
- La fecha de compromiso debe ser posterior a la fecha de vencimiento

### **3. Auditoría**

- Todos los cambios de estado deben ser registrados
- Mantener historial de cambios de estado del cliente

## 📝 **Próximos Pasos**

1. **Implementar endpoints del backend** para manejar la lógica de estados
2. **Crear jobs programados** para verificar fechas de compromiso vencidas
3. **Implementar notificaciones** para pagos pendientes
4. **Crear reportes** de pagos pendientes y clientes suspendidos
5. **Agregar validaciones** adicionales en el frontend

## 🔍 **Preguntas Pendientes**

1. ¿Qué pasa si un cliente tiene múltiples pagos pendientes?
2. ¿Cómo se maneja la reconexión de clientes suspendidos?
3. ¿Se necesita un sistema de notificaciones automáticas?
4. ¿Cómo se manejan los descuentos en pagos pendientes?

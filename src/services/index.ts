// Exportar todos los servicios de API
export { PermissionsAPI } from './permissions-api'
export { ResourcesAPI } from './resources-api'
export { PaymentsAPI } from './payments-api'
export { ClientsAPI } from './clients-api'
export { DevicesAPI } from './devices-api'
export { EmployeesAPI } from './employees-api'
export { InstallationsAPI } from './installations-api'
export { PlansAPI } from './plans-api'
export { SectorsAPI } from './sectors-api'
export { ServicesAPI } from './services-api'
export { RolesAPI } from './roles-api'
export { UsersAPI } from './users-api'
export { CompanyAPI } from './company-api'
export { ClientPaymentConfigAPI } from './client-payment-config-api'

// Exportar tipos de datos
export type {
    PaymentSummary,
    CreatePaymentData,
    UpdatePaymentData,
    AdvancePaymentData,
    NextPaymentDateResponse,
    RegenerateCodesResponse
} from './payments-api'

export type {
    ClientSummary,
    CreateClientData,
    UpdateClientData,
    ClientFilters,
    ClientMinimal
} from './clients-api'

export type {
    CreateDeviceData,
    UpdateDeviceData,
    DeviceFilters,
    DeviceSummary
} from './devices-api'

export type {
    CreateEmployeeData,
    UpdateEmployeeData,
    EmployeeFilters,
    EmployeeSummary
} from './employees-api'

export type {
    CreateInstallationData,
    UpdateInstallationData,
    InstallationFilters,
    InstallationSummary
} from './installations-api'

export type {
    CreatePlanData,
    UpdatePlanData,
    PlanFilters,
    PlanSummary
} from './plans-api'

export type {
    CreateSectorData,
    UpdateSectorData,
    SectorFilters,
    SectorSummary
} from './sectors-api'

export type {
    CreateServiceData,
    UpdateServiceData,
    ServiceFilters,
    ServiceSummary
} from './services-api'

export type {
    CreateRoleData,
    UpdateRoleData,
    RoleFilters,
    RoleSummary
} from './roles-api'

export type {
    CreateUserData,
    UpdateUserData,
    UserFilters,
    UserSummary
} from './users-api'

export type {
    CreateCompanyData,
    UpdateCompanyData,
    CompanySummary
} from './company-api'

export type {
    CreateClientPaymentConfigData,
    UpdateClientPaymentConfigData,
    ClientPaymentConfigFilters,
    ClientPaymentConfigSummary
} from './client-payment-config-api' 
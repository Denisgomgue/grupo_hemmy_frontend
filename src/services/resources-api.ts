import axios from '@/lib/axios'
import { Resource, CreateResourceData, UpdateResourceData } from '@/types/resources'

export class ResourcesAPI {
  // Obtener todos los recursos
  static async getAll(activeOnly: boolean = false): Promise<Resource[]> {
    const url = activeOnly ? '/resources?active=true' : '/resources'
    const response = await axios.get(url)
    return response.data
  }

  // Obtener recurso por ID
  static async getById(id: number): Promise<Resource> {
    const response = await axios.get(`/resources/${id}`)
    return response.data
  }

  // Obtener recurso por routeCode
  static async getByRouteCode(routeCode: string): Promise<Resource> {
    const response = await axios.get(`/resources/route/${routeCode}`)
    return response.data
  }

  // Crear nuevo recurso
  static async create(data: CreateResourceData): Promise<Resource> {
    const response = await axios.post('/resources', data)
    return response.data
  }

  // Actualizar recurso
  static async update(id: number, data: UpdateResourceData): Promise<Resource> {
    const response = await axios.patch(`/resources/${id}`, data)
    return response.data
  }

  // Activar/Desactivar recurso
  static async toggleActive(id: number): Promise<Resource> {
    const response = await axios.patch(`/resources/${id}/toggle-active`)
    return response.data
  }

  // Actualizar orden de recursos
  static async updateOrder(updates: { id: number; orderIndex: number }[]): Promise<Resource[]> {
    const response = await axios.patch('/resources/order/update', updates)
    return response.data
  }

  // Eliminar recurso
  static async delete(id: number): Promise<void> {
    await axios.delete(`/resources/${id}`)
  }
} 
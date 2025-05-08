
import { Service } from "../services/service"


export interface Plan {
  id: number
  name: string
  price: number
  speed: number 
  description: string 
  service: Service
  created_at: Date
  updated_at: Date
}
export interface JwtPayload {
  id: number
  correo: string
  rol: string
  areaId: number | null
}

export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  message?: string
  errors?: string[]
}
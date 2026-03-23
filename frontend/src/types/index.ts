export interface Usuario {
  id:       number
  nombres:  string
  apellidos:string
  correo:   string
  rol:      string
  area:     string | null
  areaId:   number | null
}

export interface LoginResponse {
  token:   string
  usuario: Usuario
}

export interface Expediente {
  id:          number
  codigo:      string
  asunto:      string
  estado:      string
  prioridad:   string
  fechaLimite: string
  createdAt:   string
  ciudadano:   { nombreCompleto: string; nroDocumento: string }
  tipoTramite: { nombre: string }
  areaActual:  { nombre: string }
  creadoPor:   { nombres: string; apellidos: string }
}

export interface Area {
  id:    number
  nombre:string
  sigla: string
}

export interface TipoTramite {
  id:          number
  nombre:      string
  diasHabiles: number
  costoSoles:  number
  areaDestino: { nombre: string; sigla: string }
}
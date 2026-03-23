import client from './client'

export const expedientesApi = {
  listar: (params?: Record<string, string>) =>
    client.get('/expedientes', { params }),

  obtener: (id: number) =>
    client.get(`/expedientes/${id}`),

  consultarPublico: (codigo: string) =>
    client.get(`/expedientes/publico/${codigo}`),

  registrar: (data: Record<string, unknown>) =>
    client.post('/expedientes', data),

  derivar: (id: number, data: { areaDestinoId: number; comentario: string }) =>
    client.put(`/expedientes/${id}/derivar`, data),

  cambiarEstado: (id: number, data: { estado: string; comentario: string }) =>
    client.put(`/expedientes/${id}/estado`, data),
}
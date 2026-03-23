import client from './client'

export const documentosApi = {
  listar: (expedienteId: number) =>
    client.get(`/documentos/expediente/${expedienteId}`),

  obtenerUrl: (id: number) =>
    client.get(`/documentos/${id}/url`),
}
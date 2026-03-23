import client from './client'

export const documentosApi = {
  listar: (expedienteId: number) =>
    client.get(`/documentos/expediente/${expedienteId}`),

  descargar: (id: number) =>
    client.get(`/documentos/${id}/descargar`, { responseType: 'blob' }),
}
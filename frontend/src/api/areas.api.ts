import client from './client'

export const areasApi = {
  listar: () => client.get('/areas'),
  listarTipos: () => client.get('/areas/tipos-tramite'),
}
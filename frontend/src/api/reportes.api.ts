import client from './client'

export const reportesApi = {
  dashboard: () => client.get('/reportes/dashboard'),
  porVencer: (dias?: number) =>
    client.get('/reportes/por-vencer', { params: { dias } }),
}
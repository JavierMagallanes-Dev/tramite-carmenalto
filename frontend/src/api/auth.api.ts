import client from './client'
import type { LoginResponse } from '../types'
export const authApi = {
  login: (correo: string, password: string) =>
    client.post<{ ok: boolean; data: LoginResponse }>('/auth/login', { correo, password }),

  logout: () => client.post('/auth/logout'),

  me: () => client.get('/auth/me'),
}
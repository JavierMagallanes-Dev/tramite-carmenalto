import { Response } from 'express'
import { ApiResponse } from '../types'

export const ok = <T>(res: Response, data: T, message?: string) => {
  const body: ApiResponse<T> = { ok: true, data, message }
  return res.status(200).json(body)
}

export const created = <T>(res: Response, data: T) => {
  return res.status(201).json({ ok: true, data })
}

export const badRequest = (res: Response, message: string) => {
  return res.status(400).json({ ok: false, message })
}

export const unauthorized = (res: Response) => {
  return res.status(401).json({ ok: false, message: 'No autorizado' })
}

export const forbidden = (res: Response) => {
  return res.status(403).json({ ok: false, message: 'Acceso denegado' })
}

export const notFound = (res: Response, message = 'Recurso no encontrado') => {
  return res.status(404).json({ ok: false, message })
}

export const serverError = (res: Response, error: unknown) => {
  console.error(error)
  return res.status(500).json({ ok: false, message: 'Error interno del servidor' })
}
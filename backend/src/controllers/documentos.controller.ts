import { Request, Response } from 'express'
import { documentosService } from '../services/documentos.service'
import { ok, created, badRequest, notFound, serverError } from '../utils/response'
import { documentosRepository } from '../repositories/documentos.repository'
import { minioClient } from '../utils/minio'
import prisma from '../utils/prisma'
export const documentosController = {
  async subir(req: Request, res: Response) {
    try {
      if (!req.file) return badRequest(res, 'No se recibió ningún archivo')

      const { expedienteId, etapa } = req.body as Record<string, string> // ✅
      if (!expedienteId) return badRequest(res, 'expedienteId es requerido')

      const data = await documentosService.subir({
        expedienteId:   parseInt(expedienteId),
        subidoPorId:    req.usuario!.id,
        nombreOriginal: req.file.originalname,
        buffer:         req.file.buffer,
        mimetype:       req.file.mimetype,
        etapa:          etapa || 'Solicitud',
      })
      return created(res, data)
    } catch (error) {
      if (error instanceof Error) return badRequest(res, error.message)
      return serverError(res, error)
    }
  },

  async listar(req: Request, res: Response) {
    try {
      const data = await documentosService.listar(parseInt(req.params['expedienteId'] as string)) // ✅
      return ok(res, data)
    } catch (error) {
      return serverError(res, error)
    }
  },

  async descargar(req: Request, res: Response) {
  try {
    const id = parseInt(req.params['id'] as string)
    console.log('[Descargar] id:', id, 'params:', req.params)

    if (isNaN(id)) return badRequest(res, 'ID inválido')

    const doc = await documentosRepository.findById(id)
    console.log('[Descargar] doc:', doc)

    if (!doc) return notFound(res, 'Documento no encontrado')

    const stream = await minioClient.getObject(
      process.env.MINIO_BUCKET || 'tramite-docs',
      doc.nombreUuid
    )

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(doc.nombreOriginal)}"`
    )
    res.setHeader('Content-Type', 'application/octet-stream')
    stream.pipe(res)
  } catch (error) {
    console.error('[Descargar] error:', error)
    if (error instanceof Error) return badRequest(res, error.message)
    return serverError(res, error)
  }
},
  async subirPublico(req: Request, res: Response) {
  try {
    if (!req.file) return badRequest(res, 'No se recibió ningún archivo')

    const expedienteId = parseInt(req.params['expedienteId'] as string)

    // Buscar usuario mesa de partes para asignar como subidor
    const mesaUser = await prisma.usuario.findFirst({
      where: { rol: { nombre: 'Mesa de Partes' }, activo: true },
    })
    if (!mesaUser) return badRequest(res, 'Error de configuración')

    const data = await documentosService.subir({
      expedienteId,
      subidoPorId:    mesaUser.id,
      nombreOriginal: req.file.originalname,
      buffer:         req.file.buffer,
      mimetype:       req.file.mimetype,
      etapa:          'Solicitud ciudadano',
    })
    return created(res, data)
  } catch (error) {
    if (error instanceof Error) return badRequest(res, error.message)
    return serverError(res, error)
  }
},
}
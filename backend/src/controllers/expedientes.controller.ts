import { Request, Response } from 'express'
import { expedientesService } from '../services/expedientes.service'
import { ok, created, badRequest, notFound, serverError } from '../utils/response'
import prisma from '../utils/prisma'
export const expedientesController = {
  async listar(req: Request, res: Response) {
    try {
      const { estado, areaId, prioridad } = req.query
      const data = await expedientesService.listar({
        estado:    estado as string,
        areaId:    areaId ? parseInt(areaId as string) : undefined,
        prioridad: prioridad as string,
      })
      return ok(res, data)
    } catch (error) {
      return serverError(res, error)
    }
  },

  async obtener(req: Request, res: Response) {
    try {
      const data = await expedientesService.obtener(parseInt(req.params['id'] as string)) // ✅
      return ok(res, data)
    } catch (error) {
      if (error instanceof Error) return notFound(res, error.message)
      return serverError(res, error)
    }
  },

  async consultarPublico(req: Request, res: Response) {
    try {
      const data = await expedientesService.consultarPublico(req.params['codigo'] as string) // ✅
      return ok(res, data)
    } catch (error) {
      if (error instanceof Error) return notFound(res, error.message)
      return serverError(res, error)
    }
  },

  async registrar(req: Request, res: Response) {
    try {
      const {
        tipoDoc, nroDocumento, nombreCompleto, correoC, celular,
        tipoTramiteId, prioridad, asunto,
      } = req.body

      if (!tipoDoc || !nroDocumento || !nombreCompleto || !tipoTramiteId || !asunto) {
        return badRequest(res, 'Faltan campos obligatorios')
      }

      const data = await expedientesService.registrar({
        tipoDoc, nroDocumento, nombreCompleto, correoC, celular,
        tipoTramiteId: parseInt(tipoTramiteId),
        prioridad:     prioridad || 'Normal',
        asunto,
        creadoPorId:   req.usuario!.id,
      })
      return created(res, data)
    } catch (error) {
      if (error instanceof Error) return badRequest(res, error.message)
      return serverError(res, error)
    }
  },

  async derivar(req: Request, res: Response) {
    try {
      const { areaDestinoId, comentario } = req.body
      if (!areaDestinoId || !comentario) {
        return badRequest(res, 'Área destino y comentario son requeridos')
      }
      const data = await expedientesService.derivar({
        expedienteId:  parseInt(req.params['id'] as string), // ✅
        usuarioId:     req.usuario!.id,
        areaDestinoId: parseInt(areaDestinoId),
        comentario,
      })
      return ok(res, data, 'Expediente derivado correctamente')
    } catch (error) {
      if (error instanceof Error) return badRequest(res, error.message)
      return serverError(res, error)
    }
  },

  async cambiarEstado(req: Request, res: Response) {
    try {
      const { estado, comentario } = req.body
      const estadosValidos = ['En proceso','Observado','Resuelto','Archivado']
      if (!estadosValidos.includes(estado)) {
        return badRequest(res, 'Estado no válido')
      }
      const data = await expedientesService.cambiarEstado({
        expedienteId: parseInt(req.params['id'] as string), // ✅
        usuarioId:    req.usuario!.id,
        estado,
        comentario:   comentario || '',
      })
      return ok(res, data, 'Estado actualizado')
    } catch (error) {
      if (error instanceof Error) return badRequest(res, error.message)
      return serverError(res, error)
    }
  },
  async registrarPublico(req: Request, res: Response) {
  try {
    const {
      tipoDoc, nroDocumento, nombreCompleto,
      correoC, celular, tipoTramiteId, asunto,
    } = req.body

    if (!tipoDoc || !nroDocumento || !nombreCompleto || !tipoTramiteId || !asunto) {
      return badRequest(res, 'Faltan campos obligatorios')
    }

    // Buscar usuario mesa de partes para asignar como creador
    const mesaUser = await prisma.usuario.findFirst({
      where: { rol: { nombre: 'Mesa de Partes' }, activo: true },
    })
    if (!mesaUser) return badRequest(res, 'No hay usuario de Mesa de Partes configurado')

    const data = await expedientesService.registrar({
      tipoDoc,
      nroDocumento,
      nombreCompleto,
      correoC,
      celular,
      tipoTramiteId: parseInt(tipoTramiteId),
      prioridad:     'Normal',
      asunto,
      creadoPorId:   mesaUser.id,
    })
    return created(res, data)
  } catch (error) {
    if (error instanceof Error) return badRequest(res, error.message)
    return serverError(res, error)
  }
},
}
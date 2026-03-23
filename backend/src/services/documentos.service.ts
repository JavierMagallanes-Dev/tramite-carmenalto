import { v4 as uuidv4 } from 'uuid'
import { minioService } from '../utils/minio'
import { documentosRepository } from '../repositories/documentos.repository'

export const documentosService = {
  async subir(data: {
    expedienteId:   number
    subidoPorId:    number
    nombreOriginal: string
    buffer:         Buffer
    mimetype:       string
    etapa:          string
  }) {
    const ext       = data.nombreOriginal.split('.').pop()
    const nombreUuid = `${uuidv4()}.${ext}`

    await minioService.subirArchivo(nombreUuid, data.buffer, data.mimetype)

    return documentosRepository.create({
      expedienteId:   data.expedienteId,
      subidoPorId:    data.subidoPorId,
      nombreOriginal: data.nombreOriginal,
      nombreUuid,
      rutaStorage:    `tramite-docs/${nombreUuid}`,
      etapa:          data.etapa,
    })
  },

  async listar(expedienteId: number) {
    return documentosRepository.findByExpediente(expedienteId)
  },

  async obtenerUrl(id: number) {
    const doc = await documentosRepository.findById(id)
    if (!doc) throw new Error('Documento no encontrado')
    const url = await minioService.obtenerUrl(doc.nombreUuid)
    return { url, nombreOriginal: doc.nombreOriginal }
  },
}
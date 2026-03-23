import * as Minio from 'minio'

const isDocker = process.env.NODE_ENV === 'production'

export const minioClient = new Minio.Client({
  endPoint:  process.env.MINIO_ENDPOINT || 'localhost',
  port:      parseInt(process.env.MINIO_PORT || '9000'),
  useSSL:    false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
})

// Cliente público para generar URLs accesibles desde el navegador
const minioPublic = new Minio.Client({
  endPoint:  isDocker ? 'localhost' : (process.env.MINIO_ENDPOINT || 'localhost'),
  port:      9000,
  useSSL:    false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
})

const BUCKET = process.env.MINIO_BUCKET || 'tramite-docs'

export const minioService = {
  async subirArchivo(
    nombreUuid: string,
    buffer: Buffer,
    mimetype: string
  ): Promise<string> {
    await minioClient.putObject(BUCKET, nombreUuid, buffer, buffer.length, {
      'Content-Type': mimetype,
    })
    return nombreUuid
  },

  async obtenerUrl(nombreUuid: string): Promise<string> {
    // Usar cliente público para que la URL apunte a localhost:9000
    return minioPublic.presignedGetObject(BUCKET, nombreUuid, 3600)
  },

  async eliminar(nombreUuid: string): Promise<void> {
    await minioClient.removeObject(BUCKET, nombreUuid)
  },
}
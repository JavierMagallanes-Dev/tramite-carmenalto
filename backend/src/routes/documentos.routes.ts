import { Router } from 'express'
import { documentosController } from '../controllers/documentos.controller'
import { verificarToken } from '../middlewares/auth.middleware'
import { upload } from '../middlewares/upload.middleware'

const router = Router()
// Pública — ciudadano adjunta documento al registrar
router.post('/publico/subir/:expedienteId',
  upload.single('archivo'),
  documentosController.subirPublico
)
router.use(verificarToken)

router.post('/subir',
  upload.single('archivo'),
  documentosController.subir
)

router.get('/expediente/:expedienteId', documentosController.listar)
router.get('/:id/descargar',           documentosController.descargar)
export default router
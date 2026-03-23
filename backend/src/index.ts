import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { iniciarJobNotificaciones } from './jobs/notificaciones.job'
import { iniciarJobVencimientos }   from './jobs/vencimientos.job'
import documentosRoutes  from './routes/documentos.routes'
dotenv.config()

import authRoutes       from './routes/auth.routes'
import usuariosRoutes   from './routes/usuarios.routes'
import areasRoutes      from './routes/areas.routes'
import expedientesRoutes from './routes/expedientes.routes'
import reportesRoutes   from './routes/reportes.routes'

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth',        authRoutes)
app.use('/api/usuarios',    usuariosRoutes)
app.use('/api/areas',       areasRoutes)
app.use('/api/expedientes', expedientesRoutes)
app.use('/api/reportes',    reportesRoutes)
app.use('/api/documentos',  documentosRoutes)
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'API funcionando', timestamp: new Date() })
})

app.use((_req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' })
})
iniciarJobNotificaciones()
iniciarJobVencimientos()
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})

export default app
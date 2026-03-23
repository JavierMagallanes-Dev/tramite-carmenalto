import cron from 'node-cron'
import prisma from '../utils/prisma'
import { enviarEmail, templates } from '../utils/mailer'

export const iniciarJobNotificaciones = () => {
  // Ejecuta cada 5 minutos — despacha emails pendientes
  cron.schedule('*/5 * * * *', async () => {
    console.log('[Job] Despachando notificaciones pendientes...')

    const pendientes = await prisma.notificacion.findMany({
      where:   { estadoEnvio: 'Pendiente' },
      include: {
        expediente: {
          include: { tipoTramite: true }
        }
      },
      take: 20, // procesa de a 20 para no saturar el SMTP
    })

    for (const notif of pendientes) {
      try {
        const exp = notif.expediente
        let html = ''

        if (notif.tipoEvento === 'Registro') {
          html = templates.registroExpediente(
            exp.codigo, exp.asunto, exp.fechaLimite
          )
        } else if (notif.tipoEvento === 'CambioEstado') {
          html = templates.cambioEstado(exp.codigo, exp.estado, '')
        } else if (notif.tipoEvento === 'ProximoVencer') {
          html = templates.proximoVencer(
            exp.codigo, exp.asunto, exp.fechaLimite
          )
        }

        if (html) {
          await enviarEmail({
            para:   notif.destinatarioEmail,
            asunto: `Trámite ${exp.codigo} — ${notif.tipoEvento}`,
            html,
          })
        }

        await prisma.notificacion.update({
          where: { id: notif.id },
          data:  { estadoEnvio: 'Enviado', enviadoAt: new Date() },
        })
      } catch (error) {
        console.error(`[Job] Error enviando notif ${notif.id}:`, error)
        await prisma.notificacion.update({
          where: { id: notif.id },
          data:  { estadoEnvio: 'Error' },
        })
      }
    }

    if (pendientes.length > 0) {
      console.log(`[Job] Procesadas ${pendientes.length} notificaciones`)
    }
  })

  console.log('[Job] Notificaciones iniciado — cada 5 minutos')
}
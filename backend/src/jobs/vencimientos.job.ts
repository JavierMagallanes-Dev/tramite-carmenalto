import cron from 'node-cron'
import prisma from '../utils/prisma'

export const iniciarJobVencimientos = () => {
  // Ejecuta todos los días a las 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('[Job] Verificando expedientes por vencer...')

    const en3dias = new Date()
    en3dias.setDate(en3dias.getDate() + 3)

    const porVencer = await prisma.expediente.findMany({
      where: {
        fechaLimite: { lte: en3dias, gte: new Date() },
        estado:      { notIn: ['Resuelto', 'Archivado'] },
      },
      include: { ciudadano: true },
    })

    for (const exp of porVencer) {
      if (!exp.ciudadano.correo) continue

      // Verificar que no se haya enviado ya hoy
      const yaNotificado = await prisma.notificacion.findFirst({
        where: {
          expedienteId: exp.id,
          tipoEvento:   'ProximoVencer',
          createdAt:    { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      })

      if (!yaNotificado) {
        await prisma.notificacion.create({
          data: {
            expedienteId:      exp.id,
            destinatarioEmail: exp.ciudadano.correo,
            tipoEvento:        'ProximoVencer',
          },
        })
      }
    }

    console.log(`[Job] ${porVencer.length} expedientes por vencer encontrados`)
  })

  console.log('[Job] Vencimientos iniciado — diario 8:00 AM')
}
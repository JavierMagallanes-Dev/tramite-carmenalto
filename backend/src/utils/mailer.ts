import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const enviarEmail = async (data: {
  para:    string
  asunto:  string
  html:    string
}) => {
  return transporter.sendMail({
    from:    `"Municipalidad Carmen Alto" <${process.env.SMTP_USER}>`,
    to:      data.para,
    subject: data.asunto,
    html:    data.html,
  })
}

export const templates = {
  registroExpediente: (codigo: string, asunto: string, fechaLimite: Date) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1e40af">Municipalidad Distrital de Carmen Alto</h2>
      <p>Su expediente ha sido registrado exitosamente.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;background:#f1f5f9"><strong>Código</strong></td>
            <td style="padding:8px">${codigo}</td></tr>
        <tr><td style="padding:8px;background:#f1f5f9"><strong>Asunto</strong></td>
            <td style="padding:8px">${asunto}</td></tr>
        <tr><td style="padding:8px;background:#f1f5f9"><strong>Fecha límite</strong></td>
            <td style="padding:8px">${fechaLimite.toLocaleDateString('es-PE')}</td></tr>
      </table>
      <p>Puede consultar el estado de su trámite en: 
         <a href="http://tramite.carmenalto.gob.pe">tramite.carmenalto.gob.pe</a>
      </p>
    </div>
  `,

  cambioEstado: (codigo: string, estado: string, comentario: string) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1e40af">Municipalidad Distrital de Carmen Alto</h2>
      <p>Su expediente <strong>${codigo}</strong> ha cambiado de estado.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;background:#f1f5f9"><strong>Nuevo estado</strong></td>
            <td style="padding:8px">${estado}</td></tr>
        <tr><td style="padding:8px;background:#f1f5f9"><strong>Comentario</strong></td>
            <td style="padding:8px">${comentario}</td></tr>
      </table>
    </div>
  `,

  proximoVencer: (codigo: string, asunto: string, fechaLimite: Date) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#dc2626">Alerta de vencimiento</h2>
      <p>El expediente <strong>${codigo}</strong> está próximo a vencer.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;background:#fef2f2"><strong>Asunto</strong></td>
            <td style="padding:8px">${asunto}</td></tr>
        <tr><td style="padding:8px;background:#fef2f2"><strong>Fecha límite</strong></td>
            <td style="padding:8px">${fechaLimite.toLocaleDateString('es-PE')}</td></tr>
      </table>
    </div>
  `,
}
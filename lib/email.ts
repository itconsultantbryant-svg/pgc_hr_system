import nodemailer from 'nodemailer'

type MailPayload = {
  to: string
  subject: string
  text: string
  html?: string
}

function getConfiguredTransport() {
  const host = process.env.SMTP_HOST?.trim()
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()
  const secure = process.env.SMTP_SECURE === 'true'

  if (!host || !port || !user || !pass) return null

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}

export async function sendEmail(payload: MailPayload): Promise<boolean> {
  const transporter = getConfiguredTransport()
  if (!transporter) return false

  const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim() || 'no-reply@localhost'
  await transporter.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  })
  return true
}

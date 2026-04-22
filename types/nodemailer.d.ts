declare module 'nodemailer' {
  type SendMailPayload = {
    from: string
    to: string
    subject: string
    text: string
    html?: string
  }

  type Transport = {
    sendMail: (payload: SendMailPayload) => Promise<unknown>
  }

  function createTransport(config: {
    host: string
    port: number
    secure: boolean
    auth: { user: string; pass: string }
  }): Transport

  const nodemailer: {
    createTransport: typeof createTransport
  }

  export default nodemailer
}

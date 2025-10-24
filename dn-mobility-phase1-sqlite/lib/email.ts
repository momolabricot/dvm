// lib/email.ts
import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
})

export async function sendMail(
  to: string,
  subject: string,
  html: string,
  attachments?: { filename: string; path: string; contentType?: string }[]
) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com'
  await transporter.sendMail({ from, to, subject, html, attachments })
}

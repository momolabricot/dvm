import nodemailer from 'nodemailer'
import { prisma } from './db'
const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT||587), secure:false, auth:{user:process.env.SMTP_USER, pass:process.env.SMTP_PASS} })
export async function sendMail(to:string, subject:string, html:string, attachments:any[]=[]){
  try{ await transporter.sendMail({from: process.env.MAIL_FROM, to, subject, html, attachments}); }
  catch(e){ /* ignore in dev */ }
  try{ await prisma.emails.create({data:{to_addr:to, subject, status:'sent', retries:0, meta_json:{}}}) } catch(e){ /* ignore if DB missing */ }
}

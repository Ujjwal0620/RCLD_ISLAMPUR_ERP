import nodemailer from "nodemailer";

const configured=Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter=configured?nodemailer.createTransport({
  host:process.env.SMTP_HOST||"smtp.gmail.com",
  port:Number(process.env.SMTP_PORT||465),
  secure:String(process.env.SMTP_SECURE||"true")==="true",
  auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}
}):null;

export async function sendEmail({to,subject,text,html}) {
  if(!transporter) throw new Error("SMTP is not configured.");
  return transporter.sendMail({from:process.env.EMAIL_FROM||process.env.SMTP_USER,to,subject,text,html});
}

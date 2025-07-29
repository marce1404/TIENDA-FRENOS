
'use server';

import nodemailer from 'nodemailer';
import { z } from 'zod';
import { getEnvSettings } from '@/lib/env';

const sendEmailSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido.' }),
  email: z.string().email({ message: 'Correo electrónico inválido.' }),
  subject: z.string().min(1, { message: 'El asunto es requerido.' }),
  message: z.string().min(1, { message: 'El mensaje es requerido.' }),
});

export async function sendEmail(formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const parsed = sendEmailSchema.safeParse(formData);

  if (!parsed.success) {
    return { success: false, error: 'Datos de formulario inválidos.' };
  }
  
  const { name, email, subject, message } = parsed.data;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_RECIPIENTS, SMTP_SECURE } = await getEnvSettings();

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_RECIPIENTS) {
    console.error('Las variables de entorno SMTP no están configuradas correctamente.');
    return { success: false, error: 'El servidor no está configurado para enviar correos. Por favor, contacta al administrador.' };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: SMTP_SECURE, // SMTP_SECURE is now guaranteed to be a boolean
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const emailHtml = `
    <div>
      <h1>Nuevo mensaje de contacto de REPUFRENOS.CL</h1>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Correo:</strong> ${email}</p>
      <p><strong>Asunto:</strong> ${subject}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    </div>
  `;

  try {
    await transporter.verify();
    await transporter.sendMail({
      from: `"${name}" <${SMTP_USER}>`,
      to: SMTP_RECIPIENTS,
      replyTo: email,
      subject: `Nuevo Contacto: ${subject}`,
      html: emailHtml,
    });
    return { success: true };
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return { success: false, error: 'No se pudo enviar el correo.' };
  }
}


'use server';

import nodemailer from 'nodemailer';
import { z } from 'zod';
import { getEnvSettings } from '@/lib/env';

const sendChatInquirySchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido.' }),
  email: z.string().email({ message: 'Correo electrónico inválido.' }),
  message: z.string().min(1, { message: 'El mensaje es requerido.' }),
});

export async function sendChatInquiry(formData: {
  name: string;
  email: string;
  message: string;
}) {
  const parsed = sendChatInquirySchema.safeParse(formData);

  if (!parsed.success) {
    return { success: false, error: 'Datos de formulario inválidos.' };
  }
  
  const { name, email, message } = parsed.data;

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
      <h1>Nueva consulta desde el Chat de REPUFRENOS.CL</h1>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Correo para responder:</strong> <a href="mailto:${email}">${email}</a></p>
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
      subject: `Nueva Consulta desde REPUFRENOS.CL Chat: ${name}`,
      html: emailHtml,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error al enviar correo de chat:', error);
    if (error.code === 'EAUTH') {
        return { success: false, error: 'Error de autenticación. Si usas Gmail, verifica que estés usando una "Contraseña de Aplicación".' };
    }
    return { success: false, error: 'No se pudo enviar el correo.' };
  }
}

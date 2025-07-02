
'use server';

import { Resend } from 'resend';
import { z } from 'zod';

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
    return { success: false, error: 'Invalid form data' };
  }
  
  const { name, email, subject, message } = parsed.data;
  
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.error('RESEND_API_KEY no está configurada.');
    return { success: false, error: 'El servidor no está configurado para enviar correos.' };
  }

  const resend = new Resend(resendApiKey);

  const emailHtml = `
    <div>
      <h1>Nuevo mensaje de contacto de todofrenos.cl</h1>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Correo:</strong> ${email}</p>
      <p><strong>Asunto:</strong> ${subject}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: 'Contacto Web <onboarding@resend.dev>',
      to: 'contacto@todofrenos.cl',
      subject: `Nuevo Contacto: ${subject}`,
      reply_to: email,
      html: emailHtml,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'No se pudo enviar el correo.' };
  }
}

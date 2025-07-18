
'use server';

import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';
import { getEnvSettings } from '@/lib/env';

// Schema for receiving Base64 data from the client
const uploadSchema = z.object({
  fileBase64: z.string().startsWith('data:image/'),
  fileName: z.string().min(1, 'File name is required.'),
  uploadDir: z.string().min(1, 'Upload directory is required.'),
});

type UploadInput = z.infer<typeof uploadSchema>;

// Configure Cloudinary using environment variables
async function configureCloudinary() {
  const { 
    CLOUDINARY_CLOUD_NAME, 
    CLOUDINARY_API_KEY, 
    CLOUDINARY_API_SECRET 
  } = await getEnvSettings();

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Las credenciales de Cloudinary no están configuradas en el servidor.');
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadImage(input: UploadInput): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    await configureCloudinary();
  } catch (error: any) {
    console.error('Error de configuración de Cloudinary:', error.message);
    return { success: false, error: error.message };
  }
  
  const validatedFields = uploadSchema.safeParse(input);
  
  if (!validatedFields.success) {
      console.error('Invalid input data:', validatedFields.error);
    return { success: false, error: 'Datos de entrada inválidos.' };
  }

  const { fileBase64, fileName, uploadDir } = validatedFields.data;

  try {
    const result = await cloudinary.uploader.upload(fileBase64, {
      public_id: fileName,
      folder: uploadDir,
      overwrite: true,
    });

    if (!result.secure_url) {
      console.error('Error en la respuesta de Cloudinary:', result);
      throw new Error('La carga a Cloudinary no devolvió una URL segura.');
    }

    return { success: true, url: result.secure_url };
  } catch (error) {
    console.error('Error al subir imagen a Cloudinary:', error);
    // Be careful not to expose detailed error messages to the client
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido del servidor.';
    return { success: false, error: `Error del servidor al subir la imagen.` };
  }
}

    
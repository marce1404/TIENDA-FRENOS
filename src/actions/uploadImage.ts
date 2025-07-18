
'use server';

import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';
import { getEnvSettings } from '@/lib/env';

const uploadSchema = z.object({
  file: z.instanceof(File),
  fileName: z.string().min(1, 'File name is required.'),
  uploadDir: z.string().min(1, 'Upload directory is required.'),
});

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

// Helper function to convert file to a base64 data URI
async function fileToDataUri(file: File) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    return `data:${file.type};base64,${base64}`;
}


export async function uploadImage(formData: FormData): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    await configureCloudinary();
  } catch (error: any) {
    console.error('Error de configuración de Cloudinary:', error.message);
    return { success: false, error: error.message };
  }
  
  const file = formData.get('file');
  const fileName = formData.get('fileName');
  const uploadDir = formData.get('uploadDir');
  
  const validatedFields = uploadSchema.safeParse({ file, fileName, uploadDir });
  
  if (!validatedFields.success) {
    return { success: false, error: 'Datos de entrada inválidos.' };
  }

  const { file: validFile, fileName: validFileName, uploadDir: validUploadDir } = validatedFields.data;

  if (validFile.size === 0) {
    return { success: false, error: 'Por favor, selecciona un archivo.' };
  }
  
  try {
    const dataUri = await fileToDataUri(validFile);
    
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: validUploadDir,
      public_id: validFileName,
      overwrite: true,
    });
    
    if (!result.secure_url) {
      throw new Error('La carga a Cloudinary no devolvió una URL segura.');
    }

    return { success: true, url: result.secure_url }
  } catch (error) {
    console.error('Error al subir imagen a Cloudinary:', error);
    return { success: false, error: 'Error del servidor al subir la imagen.' };
  }
}

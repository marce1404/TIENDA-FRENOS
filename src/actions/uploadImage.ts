
'use server';

import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';
import { getEnvSettings } from '@/lib/env';

// Configure Cloudinary using environment variables
// This is now the single source of truth for this action.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const uploadSchema = z.object({
  fileAsDataUrl: z.string().startsWith('data:image/'),
  fileName: z.string(),
  uploadDir: z.string(),
});

type UploadInput = z.infer<typeof uploadSchema>;

/**
 * Uploads an image to Cloudinary using its Base64 data URL representation.
 * @param {UploadInput} input - The data for the image to upload.
 * @returns {Promise<{ success: true; filePath: string } | { success: false; error: string }>}
 */
export async function uploadImage(input: UploadInput): Promise<{ success: true; filePath: string } | { success: false; error: string }> {
  const validatedFields = uploadSchema.safeParse(input);
  if (!validatedFields.success) {
    return { success: false, error: 'Datos de entrada inválidos.' };
  }
  
  const { fileAsDataUrl, fileName, uploadDir } = validatedFields.data;
  
  try {
    // Check if the credentials are set in the environment
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error('Cloudinary environment variables are not set on the server.');
    }

    const result = await cloudinary.uploader.upload(fileAsDataUrl, {
      public_id: fileName, // Use the provided filename without extension
      folder: uploadDir, // Use the provided directory as a folder in Cloudinary
      overwrite: true, // Overwrite if a file with the same public_id exists
    });

    console.log(`Image uploaded successfully to Cloudinary: ${result.secure_url}`);
    return { success: true, filePath: result.secure_url };
  } catch (error: any) {
    console.error('Error al subir imagen a Cloudinary:', error);
    return { success: false, error: error.message || 'Error del servidor al subir la imagen.' };
  }
}

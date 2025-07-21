
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

const uploadSchema = z.object({
  file: z.instanceof(File),
  fileName: z.string(),
  uploadDir: z.string(),
});

type UploadInput = z.infer<typeof uploadSchema>;

/**
 * DEPRECATED: This function attempts to save files to the local filesystem,
 * which is not supported in serverless environments like Vercel.
 * It is kept for historical purposes but should not be used.
 * @deprecated Use a cloud storage provider like Cloudinary instead.
 */
export async function uploadImage(input: UploadInput): Promise<{ success: true; filePath: string } | { success: false; error: string }> {
  console.warn("DEPRECATED: uploadImage to local filesystem is not supported on Vercel.");
  
  const validatedFields = uploadSchema.safeParse(input);
  if (!validatedFields.success) {
    return { success: false, error: 'Datos de entrada inválidos.' };
  }
  
  const { file, fileName, uploadDir } = validatedFields.data;

  // The 'public' directory is served at the root.
  // e.g., 'public/images/products' will be accessible at '/images/products'
  const targetDir = path.join(process.cwd(), 'public', uploadDir);
  const filePath = path.join(targetDir, fileName);
  const publicPath = path.join('/', uploadDir, fileName).replace(/\\/g, '/');

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create directory if it doesn't exist
    await fs.mkdir(targetDir, { recursive: true });
    
    // Write the file to the public directory
    await fs.writeFile(filePath, buffer);

    console.log(`File uploaded successfully to ${filePath}`);
    return { success: true, filePath: publicPath };
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return { success: false, error: 'Error del servidor al subir la imagen.' };
  }
}

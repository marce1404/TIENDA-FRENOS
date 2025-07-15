
'use server';

import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

const uploadSchema = z.object({
  file: z.instanceof(File),
  fileName: z.string().min(1, 'File name is required.'),
  uploadDir: z.string().min(1, 'Upload directory is required.'),
});

export async function uploadImage(formData: FormData): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const file = formData.get('file');
  const fileName = formData.get('fileName');
  const uploadDir = formData.get('uploadDir');
  
  const validatedFields = uploadSchema.safeParse({ file, fileName, uploadDir });
  
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const { file: validFile, fileName: validFileName, uploadDir: validUploadDir } = validatedFields.data;

  if (validFile.size === 0) {
    return { success: false, error: 'Please select a file.' };
  }

  try {
    const buffer = Buffer.from(await validFile.arrayBuffer());
    // Sanitize filename to prevent directory traversal
    const sanitizedFileName = validFileName.replace(/[^a-z0-9_.-]/gi, '_');
    const extension = path.extname(validFile.name) || '.png';
    const finalFilename = `${sanitizedFileName}${extension}`;
    
    const publicDir = path.join(process.cwd(), 'public', validUploadDir);
    const uploadPath = path.join(publicDir, finalFilename);

    // Ensure the directory exists
    await fs.mkdir(publicDir, { recursive: true });

    // Write the file
    await fs.writeFile(uploadPath, buffer);

    const publicUrl = `/${validUploadDir}/${finalFilename}`;
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error uploading image:', error);
    // Provide a more generic error for security
    return { success: false, error: 'Failed to upload image due to a server error.' };
  }
}

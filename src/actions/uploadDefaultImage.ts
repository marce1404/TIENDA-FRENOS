
'use server';

import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

const uploadSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(['pastilla', 'disco']),
});

export async function uploadDefaultImage(formData: FormData): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const file = formData.get('file');
  const type = formData.get('type');

  const validatedFields = uploadSchema.safeParse({ file, type });

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const { file: validFile, type: validType } = validatedFields.data;

  if (validFile.size === 0) {
    return { success: false, error: 'Please select a file.' };
  }

  try {
    const buffer = Buffer.from(await validFile.arrayBuffer());
    
    // Use a fixed filename based on the type
    const extension = path.extname(validFile.name) || '.png';
    const filename = `default_${validType}${extension}`;
    
    const publicDir = path.join(process.cwd(), 'public', 'images', 'defaults');
    const uploadPath = path.join(publicDir, filename);

    // Ensure the directory exists
    await fs.mkdir(publicDir, { recursive: true });

    // Write the file, overwriting if it exists
    await fs.writeFile(uploadPath, buffer);

    // Use a cache-busting query parameter to ensure the browser fetches the new image
    const publicUrl = `/images/defaults/${filename}?v=${new Date().getTime()}`;
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error uploading default image:', error);
    return { success: false, error: 'Failed to upload image.' };
  }
}

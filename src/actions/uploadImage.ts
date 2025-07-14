'use server';

import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

const uploadSchema = z.object({
  file: z.instanceof(File),
  productCode: z.string().min(1, 'Product code is required.'),
});

export async function uploadImage(formData: FormData): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const file = formData.get('file');
  const productCode = formData.get('productCode');

  const validatedFields = uploadSchema.safeParse({ file, productCode });

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const { file: validFile, productCode: validProductCode } = validatedFields.data;

  if (validFile.size === 0) {
    return { success: false, error: 'Please select a file.' };
  }

  try {
    const buffer = Buffer.from(await validFile.arrayBuffer());
    // Sanitize product code to use as a filename
    const sanitizedCode = validProductCode.replace(/[^a-z0-9_.-]/gi, '_');
    const extension = path.extname(validFile.name) || '.png'; // Default to .png if no extension
    const filename = `${sanitizedCode}${extension}`;
    
    const publicDir = path.join(process.cwd(), 'public', 'images', 'products');
    const uploadPath = path.join(publicDir, filename);

    // Ensure the directory exists
    await fs.mkdir(publicDir, { recursive: true });

    // Write the file
    await fs.writeFile(uploadPath, buffer);

    const publicUrl = `/images/products/${filename}`;
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: 'Failed to upload image.' };
  }
}

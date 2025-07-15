
'use server';

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

  const { file: validFile } = validatedFields.data;

  if (validFile.size === 0) {
    return { success: false, error: 'Please select a file.' };
  }

  // Vercel has a read-only filesystem. We can't write files.
  // Instead, we convert the image to a base64 Data URL and store it in localStorage on the client.
  try {
    const buffer = Buffer.from(await validFile.arrayBuffer());
    const mimeType = validFile.type || 'image/png';
    const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

    // The data URL can be very long. Check if it exceeds a reasonable limit (e.g., 4MB)
    if (dataUrl.length > 4 * 1024 * 1024) {
      return { success: false, error: 'Image is too large. Please use an image under 4MB.' };
    }

    return { success: true, url: dataUrl };
  } catch (error) {
    console.error('Error converting default image to Data URL:', error);
    return { success: false, error: 'Failed to process image.' };
  }
}


'use server';

import { db } from '@/lib/db/drizzle';
import { settings as settingsTable } from '@/lib/db/schema';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// This schema defines all possible settings keys that can be saved.
// .partial() makes all fields optional, allowing us to save subsets of settings.
const settingsSchema = z.object({
  'ADMIN_USER_1_USERNAME': z.string().optional(),
  'ADMIN_USER_1_PASSWORD': z.string().optional(),
  'ADMIN_USER_2_USERNAME': z.string().optional(),
  'ADMIN_USER_2_PASSWORD': z.string().optional(),
  'ADMIN_USER_3_USERNAME': z.string().optional(),
  'ADMIN_USER_3_PASSWORD': z.string().optional(),
  'SMTP_HOST': z.string().optional(),
  'SMTP_PORT': z.string().optional(),
  'SMTP_USER': z.string().optional(),
  'SMTP_PASS': z.string().optional(),
  'SMTP_RECIPIENTS': z.string().optional(),
  'SMTP_SECURE': z.string().optional(), // It will be received as 'true' or 'false' string
  'CLOUDINARY_CLOUD_NAME': z.string().optional(),
  'CLOUDINARY_API_KEY': z.string().optional(),
  'CLOUDINARY_API_SECRET': z.string().optional(),
  'WHATSAPP_NUMBER': z.string().optional(),
  'WHATSAPP_CONTACT_NAME': z.string().optional(),
  'DEFAULT_PASTILLA_IMAGE_URL': z.string().optional(),
  'DEFAULT_DISCO_IMAGE_URL': z.string().optional(),
}).partial();

type Settings = z.infer<typeof settingsSchema>;

/**
 * Saves settings to the database. It performs an "upsert" operation for each key provided.
 * If a key exists, it's updated. If not, it's inserted.
 * @param settingsToSave An object where keys are the setting name and values are the setting value.
 * @returns An object indicating success or failure.
 */
export async function saveEnvSettings(settingsToSave: Settings): Promise<{ success: true } | { success: false, error: string }> {
  const parsed = settingsSchema.safeParse(settingsToSave);

  if (!parsed.success) {
    console.error('Invalid data sent to saveEnvSettings:', parsed.error);
    return { success: false, error: 'Datos inválidos.' };
  }

  const data = parsed.data;

  try {
    // Start a transaction to perform all upserts atomically.
    await db.transaction(async (tx) => {
      for (const key in data) {
        // We cast key to the correct type to satisfy TypeScript
        const typedKey = key as keyof Settings;
        const value = data[typedKey];
        
        // Skip saving password fields if they are empty, null, or undefined.
        // This prevents overwriting a saved password with nothing.
        if (typedKey.includes('PASSWORD') && !value) {
            continue;
        }

        // Ensure we only process keys with defined values
        if (value !== undefined) {
             // Ensure all values are stored as strings, handling nulls gracefully.
            const valueToStore = value === null ? '' : String(value);

            await tx.insert(settingsTable)
                .values({ key: typedKey, value: valueToStore })
                .onConflictDoUpdate({
                    target: settingsTable.key,
                    set: { value: valueToStore },
                });
        }
      }
    });

    // Revalidate the entire site layout to ensure new settings are loaded everywhere.
    revalidatePath('/', 'layout');
    
    return { success: true };
  } catch (error) {
    console.error('Error saving settings to database:', error);
    return { success: false, error: 'No se pudo guardar la configuración en la base de datos.' };
  }
}

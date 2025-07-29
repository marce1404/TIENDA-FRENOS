
'use server';

import { db } from '@/lib/db/drizzle';
import { settings as settingsTable } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Define a flexible schema that accepts any key-value pairs where values are strings.
const settingsSchema = z.record(z.string(), z.string().optional());

/**
 * Saves a batch of settings to the 'settings' table in the database.
 * This function uses an "upsert" logic: it updates the value if the key exists,
 * or inserts a new row if the key does not exist.
 *
 * @param {Record<string, any>} settingsToSave - An object containing the settings to save.
 * @returns {Promise<{ success: boolean; error?: string }>} An object indicating success or failure.
 */
export async function saveEnvSettings(
  settingsToSave: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  const validatedSettings = settingsSchema.safeParse(settingsToSave);

  if (!validatedSettings.success) {
    return {
      success: false,
      error: `Datos de entrada inválidos: ${validatedSettings.error.message}`,
    };
  }

  const entries = Object.entries(validatedSettings.data).filter(
    ([_, value]) => value !== undefined && value !== null
  );

  if (entries.length === 0) {
    return { success: true }; // Nothing to save
  }

  try {
    // Drizzle's db.transaction is used to ensure all settings are saved in a single atomic operation.
    // This means either all settings are saved successfully, or none are.
    await db.transaction(async (tx) => {
      for (const [key, value] of entries) {
        await tx
          .insert(settingsTable)
          .values({ key, value: value as string })
          .onConflictDoUpdate({
            target: settingsTable.key,
            set: { value: value as string },
          });
      }
    });

    // Revalidate the admin path to ensure the UI shows the new values.
    revalidatePath('/admin');
    revalidatePath('/'); // Revalidate home page for components that use settings like WhatsApp button

    return { success: true };
  } catch (error: any) {
    console.error('Error saving settings to database:', error);
    // Provide a more specific error message if available
    const errorMessage = error.message.includes('relation "settings" does not exist')
        ? 'La tabla "settings" no existe. Ejecuta `npm run db:seed` para crearla.'
        : 'No se pudo guardar la configuración en la base de datos.';
        
    return {
      success: false,
      error: errorMessage,
    };
  }
}

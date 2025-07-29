
'use server';

import { db } from '@/lib/db/drizzle';
import { settings as settingsTable } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

// Define a flexible schema that accepts any key-value pairs where values are strings.
const settingsSchema = z.record(z.string(), z.string().optional());

/**
 * Saves a batch of settings to the 'settings' table in the database.
 * This function uses an "upsert" logic: it updates the value if the key exists,
 * or inserts a new row if the key does not exist.
 *
 * NOTE: This function does NOT use a transaction, as it's not supported by the neon-http driver.
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
    for (const [key, value] of entries) {
      await db
        .insert(settingsTable)
        .values({ key, value: value as string })
        .onConflictDoUpdate({
          target: settingsTable.key,
          set: { value: value as string },
          where: eq(settingsTable.key, key),
        });
    }

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


/**
 * Retrieves the current contact counter, increments it by 1, and saves it back to the database.
 * @returns {Promise<number>} The new, incremented counter value.
 */
export async function getAndIncrementContactCounter(): Promise<number> {
    const counterKey = 'CONTACT_COUNTER';
    
    try {
        const result = await db.select({ value: settingsTable.value }).from(settingsTable).where(eq(settingsTable.key, counterKey));
        
        let currentCounter = 0;
        if (result.length > 0 && result[0].value) {
            currentCounter = parseInt(result[0].value, 10);
        }
        
        const newCounter = currentCounter + 1;
        
        await db
            .insert(settingsTable)
            .values({ key: counterKey, value: newCounter.toString() })
            .onConflictDoUpdate({
                target: settingsTable.key,
                set: { value: newCounter.toString() },
                where: eq(settingsTable.key, counterKey),
            });
            
        return newCounter;

    } catch (error) {
        console.error("Failed to get and increment contact counter:", error);
        // Fallback to a random number if DB operation fails, so email can still be sent.
        return Math.floor(Math.random() * 1000);
    }
}

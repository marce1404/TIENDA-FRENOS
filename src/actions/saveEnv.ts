
'use server';

/**
 * Placeholder function for saving environment settings.
 * In a Vercel environment, environment variables are not writable at runtime.
 * They must be configured in the Vercel project settings.
 * 
 * This action will always return a message informing the user about this.
 * The form in the admin panel is useful for seeing the current values, but saving
 * must be done through the Vercel dashboard.
 * 
 * @param settingsToSave - An object containing the settings the user wants to save.
 * @returns An object indicating failure and providing instructions.
 */
export async function saveEnvSettings(settingsToSave: Record<string, any>): Promise<{ success: false, error: string }> {
  console.warn("Attempted to save settings at runtime in a Vercel environment. This is not supported.");
  
  const keysAttempted = Object.keys(settingsToSave).join(', ');

  return { 
    success: false, 
    error: `No se pudieron guardar las configuraciones (${keysAttempted}). En Vercel, las variables de entorno son de solo lectura y deben actualizarse en el panel de control del proyecto.` 
  };
}


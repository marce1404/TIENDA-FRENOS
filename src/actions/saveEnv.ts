
'use server';

import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

const envSchema = z.object({
  ADMIN_USER_1_USERNAME: z.string().optional(),
  ADMIN_USER_1_PASSWORD: z.string().optional(),
  ADMIN_USER_2_USERNAME: z.string().optional(),
  ADMIN_USER_2_PASSWORD: z.string().optional(),
  ADMIN_USER_3_USERNAME: z.string().optional(),
  ADMIN_USER_3_PASSWORD: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_RECIPIENTS: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
});

type EnvSettings = z.infer<typeof envSchema>;

async function readEnvFile(envPath: string): Promise<Record<string, string>> {
  try {
    const content = await fs.readFile(envPath, 'utf-8');
    const envVars: Record<string, string> = {};
    content.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    return envVars;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return {}; // File doesn't exist, return empty object
    }
    throw error; // Other errors
  }
}

export async function saveEnvSettings(settings: EnvSettings) {
  const parsed = envSchema.safeParse(settings);

  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos.' };
  }

  const envPath = path.resolve(process.cwd(), '.env');

  try {
    const currentEnv = await readEnvFile(envPath);
    
    const newSettings = parsed.data;

    // Check if this is the first time setting a multi-user config
    // to migrate away from the old single-user variables.
    const isMigratingToMultiUser = 
        newSettings.ADMIN_USER_1_USERNAME !== undefined &&
        !currentEnv.ADMIN_USER_1_USERNAME;

    if (isMigratingToMultiUser) {
        delete currentEnv.ADMIN_USERNAME;
        delete currentEnv.ADMIN_PASSWORD;
    }

    // Merge new settings. 
    for (const key in newSettings) {
        const typedKey = key as keyof EnvSettings;
        const value = newSettings[typedKey];

        if (value !== undefined) { // A value was submitted in the form
            if (value === '') { // An empty string means "delete this setting"
                delete currentEnv[typedKey];
            } else { // A non-empty string means "update this setting"
                currentEnv[typedKey] = value;
            }
        }
        // If value is undefined, it wasn't in the form, so we don't touch it.
    }
    
    const newEnvContent = Object.entries(currentEnv)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    await fs.writeFile(envPath, newEnvContent + '\n', 'utf-8');
    
    return { success: true };
  } catch (error) {
    console.error('Error al guardar el archivo .env:', error);
    return { success: false, error: 'No se pudo guardar la configuración en el servidor.' };
  }
}


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
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
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

    // If user 1's username is being submitted (even if empty), consider it a migration action.
    if (parsed.data.ADMIN_USER_1_USERNAME !== undefined) {
        delete currentEnv.ADMIN_USERNAME;
        delete currentEnv.ADMIN_PASSWORD;
    }

    // Merge new settings. If a value is provided, update it. If it's an empty string, remove the key.
    for (const [key, value] of Object.entries(parsed.data)) {
        if (value) { // This handles non-empty strings
            currentEnv[key] = value;
        } else if (value === '') { // This handles empty strings, meaning "delete this setting"
            delete currentEnv[key];
        }
        // `null` or `undefined` values from the form are ignored and do not change the file.
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

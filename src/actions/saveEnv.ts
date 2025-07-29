
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
}).partial(); // Allow partial updates

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
    console.error('Invalid data sent to saveEnvSettings:', parsed.error);
    return { success: false, error: 'Datos inválidos.' };
  }

  const envPath = path.resolve(process.cwd(), '.env');

  try {
    const currentEnv = await readEnvFile(envPath);
    const newSettings = parsed.data;

    const isMigratingToMultiUser = 
        newSettings.ADMIN_USER_1_USERNAME !== undefined &&
        !currentEnv.ADMIN_USER_1_USERNAME &&
        currentEnv.ADMIN_USERNAME;

    if (isMigratingToMultiUser) {
        delete currentEnv.ADMIN_USERNAME;
        delete currentEnv.ADMIN_PASSWORD;
    }

    for (const key in newSettings) {
        const typedKey = key as keyof EnvSettings;
        const value = newSettings[typedKey];

        if (value === '') { 
            delete currentEnv[typedKey];
        } else if (value !== undefined) {
            currentEnv[typedKey] = value;
        }
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

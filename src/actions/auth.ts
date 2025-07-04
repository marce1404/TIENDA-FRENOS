
'use server';

import { getEnvSettings } from '@/lib/env';

export async function verifyCredentials(
  username?: string,
  password?: string
): Promise<boolean> {
  if (!username || !password) {
    return false;
  }

  const { ADMIN_USERNAME, ADMIN_PASSWORD } = await getEnvSettings();
  
  // Usa valores por defecto si las variables de entorno no existen.
  const adminUsername = ADMIN_USERNAME || 'admin';
  const adminPassword = ADMIN_PASSWORD || 'admin123';

  return username === adminUsername && password === adminPassword;
}

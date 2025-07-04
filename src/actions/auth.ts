
'use server';

import { getEnvSettings } from '@/lib/env';

export async function verifyPassword(password: string): Promise<boolean> {
  const { ADMIN_PASSWORD } = await getEnvSettings();
  
  // Usa la contraseña del archivo .env si existe, si no, usa 'admin123' como respaldo.
  const adminPassword = ADMIN_PASSWORD || 'admin123';

  return password === adminPassword;
}

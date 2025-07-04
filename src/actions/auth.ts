
'use server';

import { getEnvSettings } from '@/lib/env';

export async function verifyCredentials(
  username?: string,
  password?: string
): Promise<boolean> {
  if (!username || !password) {
    return false;
  }

  const { users } = await getEnvSettings();
  
  // Usa valores por defecto si no hay usuarios configurados.
  if (users.length === 0) {
    return username === 'admin' && password === 'admin123';
  }

  const user = users.find(u => u.username === username);
  if (!user) {
    return false;
  }
  
  // The password from env might be undefined if not set
  if (!user.password) {
    return false;
  }

  return password === user.password;
}

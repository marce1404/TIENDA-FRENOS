
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
  
  // Filter out any empty user objects that might be placeholders
  const configuredUsers = users.filter(u => u.username && u.password);

  // If no users are configured in the .env file, use hardcoded defaults.
  if (configuredUsers.length === 0) {
    return username === 'admin' && password === 'admin123';
  }

  // If users are configured, find the matching one.
  const user = configuredUsers.find(u => u.username === username);

  // If no user with that username is found, deny access.
  if (!user) {
    return false;
  }
  
  // Finally, compare the provided password with the configured one.
  return password === user.password;
}

'use server';

export async function verifyPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('La variable de entorno ADMIN_PASSWORD no está configurada.');
    return false;
  }

  return password === adminPassword;
}

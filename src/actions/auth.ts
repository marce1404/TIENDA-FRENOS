'use server';

export async function verifyPassword(password: string): Promise<boolean> {
  // Usa la variable de entorno si está disponible; si no, usa 'admin123' como respaldo.
  // Esto asegura que el inicio de sesión funcione incluso si el archivo .env aún no ha sido cargado por el servidor.
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  return password === adminPassword;
}

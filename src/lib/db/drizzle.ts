import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Vercel inyecta la variable de entorno POSTGRES_URL.
// process.env.POSTGRES_URL es la forma correcta de acceder a ella en producción.
if (!process.env.POSTGRES_URL) {
  throw new Error('La variable de entorno POSTGRES_URL no está definida.');
}

// Crear un pool de conexiones. Esto es más robusto para entornos serverless.
const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

// Usar el pool con Drizzle.
export const db = drizzle(pool, { schema });

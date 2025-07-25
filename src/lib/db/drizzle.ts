import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { config } from 'dotenv';

// Para el desarrollo local, carga las variables desde .env
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' });
}

if (!process.env.POSTGRES_URL) {
  throw new Error('La variable de entorno POSTGRES_URL no está definida.');
}

// Deshabilita el cacheo de la conexión para entornos serverless
neonConfig.fetchConnectionCache = false;
const sql = neon(process.env.POSTGRES_URL);

export const db = drizzle(sql, { schema });

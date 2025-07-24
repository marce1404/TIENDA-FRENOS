
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';
import { config } from 'dotenv';

// Cargar explícitamente las variables de entorno del archivo .env.
// Vercel inyecta las variables de entorno, pero esta línea asegura
// que estén disponibles de forma consistente en todos los entornos,
// especialmente durante la inicialización del módulo.
config({ path: '.env' });
 
// Use this object to send drizzle queries to your DB
export const db = drizzle(sql, { schema });

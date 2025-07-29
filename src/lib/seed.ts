// This is a development-only script to seed the database with initial data.
// To use it, you'll need to run it with a tool like `tsx` or `ts-node`
// that can handle TypeScript and environment variables.
// Example: `npm run db:seed`

import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { sql } from 'drizzle-orm';

// --- Robust .env file loading ---
const rootPath = process.cwd();
const envLocalPath = path.resolve(rootPath, '.env.local');
const envPath = path.resolve(rootPath, '.env');

if (fs.existsSync(envLocalPath)) {
  console.log('⚡️ Loading environment variables from .env.local');
  config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  console.log('⚡️ Loading environment variables from .env');
  config({ path: envPath });
}
// --- End of robust loading ---

import { db } from './db/drizzle';
import { products as productsTable, settings as settingsTable } from './db/schema';
import productsData from '../data/products.json';


async function seed() {
  console.log('🌱 Seeding database...');
  console.log('-------------------------------');

  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error(
      `❌ POSTGRES_URL no se encontró. Asegúrate de que tu archivo .env o .env.local en la raíz del proyecto existe y contiene la variable POSTGRES_URL.`
    );
  }
  console.log('✅ POSTGRES_URL encontrada. Conectando a la base de datos...');

  // Step 1: Create tables if they don't exist
  console.log('📝 Creating tables if they do not exist...');
  
  await (db as any).client.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      compatibility TEXT NOT NULL,
      price INTEGER NOT NULL,
      category TEXT NOT NULL,
      is_featured BOOLEAN DEFAULT false NOT NULL,
      image_url TEXT,
      is_on_sale BOOLEAN DEFAULT false,
      sale_price INTEGER
    );
  `);
  console.log('✅ Table "products" checked/created.');

  await (db as any).client.query(`
    CREATE TABLE IF NOT EXISTS settings (
      "key" TEXT PRIMARY KEY,
      "value" TEXT
    );
  `);
  console.log('✅ Table "settings" checked/created.');


  // Step 2: Seed products table
  console.log('🗑️  Clearing existing products table...');
  await db.delete(productsTable);
  console.log('🗑️  Table "products" cleared.');

  console.log(' Inserting new products data...');
  for (const product of productsData) {
    await db.insert(productsTable).values({
      id: product.id,
      code: product.code,
      name: product.name,
      brand: product.brand,
      model: product.model,
      compatibility: product.compatibility,
      price: product.price,
      category: product.category,
      isFeatured: product.isFeatured || false,
      imageUrl: product.imageUrl,
      isOnSale: product.isOnSale || false,
      salePrice: product.salePrice ? product.salePrice : null,
    });
    console.log(`- Inserted product: ${product.name}`);
  }
  console.log(`✅ Inserted ${productsData.length} products.`);

  // Step 3: Seed settings table with default values (optional, but good practice)
   console.log('⚙️  Seeding settings table with default values...');
   const defaultSettings = [
     { key: 'WHATSAPP_NUMBER', value: '56912345678' },
     { key: 'WHATSAPP_CONTACT_NAME', value: 'Ventas' },
     { key: 'ADMIN_USER_1_USERNAME', value: 'admin' },
     { key: 'ADMIN_USER_1_PASSWORD', value: 'admin123' },
   ];

   for (const setting of defaultSettings) {
      await db.insert(settingsTable)
        .values(setting)
        .onConflictDoUpdate({ 
            target: settingsTable.key, 
            set: { value: setting.value },
            where: sql`${settingsTable.key} = ${setting.key}` 
        });
      console.log(`- Upserted setting: ${setting.key}`);
   }
   console.log(`✅ Upserted ${defaultSettings.length} default settings.`);


  console.log('-------------------------------');
  console.log('✅ Seeding complete.');
  // The script will exit automatically.
}

seed().catch((error) => {
  console.error('❌ Seeding failed:');
  console.error(error);
  process.exit(1);
});

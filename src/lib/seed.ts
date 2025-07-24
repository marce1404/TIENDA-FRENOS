
// This is a development-only script to seed the database with initial data.
// To use it, you'll need to run it with a tool like `tsx` or `ts-node`
// that can handle TypeScript and environment variables.
// Example: `npx tsx src/lib/seed.ts`

import { db } from './db/drizzle';
import { products as productsTable } from './db/schema';
import productsData from '../data/products.json';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

// --- Robust .env file loading ---
// The path to the project root.
const rootPath = process.cwd();

// Prioritize .env.local for local development secrets, then fall back to .env
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

async function seed() {
  console.log('🌱 Seeding database...');
  console.log('-------------------------------');

  // Explicitly check if the environment variable is loaded.
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error(
      `❌ POSTGRES_URL no se encontró. Asegúrate de que tu archivo .env o .env.local en la raíz del proyecto existe y contiene la variable POSTGRES_URL.`
    );
  }
  console.log('✅ POSTGRES_URL encontrada. Conectando a la base de datos...');


  // Clear existing data
  console.log('🗑️  Clearing existing products table...');
  await db.delete(productsTable);
  console.log('🗑️  Table cleared.');


  // Insert new data
  console.log(' Inserting new products data...');
  for (const product of productsData) {
    await db.insert(productsTable).values({
      id: product.id,
      code: product.code,
      name: product.name,
      brand: product.brand,
      model: product.model,
      compatibility: product.compatibility,
      price: product.price, // Use number directly
      category: product.category,
      isFeatured: product.isFeatured || false,
      imageUrl: product.imageUrl,
      isOnSale: product.isOnSale || false,
      salePrice: product.salePrice ? product.salePrice : null,
    });
    console.log(`- Inserted: ${product.name}`);
  }

  console.log('-------------------------------');
  console.log('✅ Seeding complete.');
  // The script will exit automatically.
}

seed().catch((error) => {
  console.error('❌ Seeding failed:');
  console.error(error);
  process.exit(1);
});

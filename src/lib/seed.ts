// This is a development-only script to seed the database with initial data.
// To use it, you'll need to run it with a tool like `tsx` or `ts-node`
// that can handle TypeScript and environment variables.
// Example: `pnpm dlx tsx src/lib/seed.ts`

import { db } from './db/drizzle';
import { products as productsTable } from './db/schema';
import productsData from '../data/products.json';
import { config } from 'dotenv';

// Load environment variables from .env file
config({ path: '.env.local' });

async function seed() {
  const dbUrl = process.env.POSTGRES_URL;
  if (!dbUrl) {
    throw new Error(
      'POSTGRES_URL is not set. Please add it to your .env.local file.',
    );
  }

  console.log('🌱 Seeding database...');
  console.log('-------------------------------');

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
      salePrice: product.salePrice ? product.salePrice : null, // Use number or null
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

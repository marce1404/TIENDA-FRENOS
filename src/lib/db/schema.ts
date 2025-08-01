import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  pgEnum,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  compatibility: text('compatibility').notNull(),
  price: integer('price').notNull(),
  category: text('category').notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  imageUrl: text('image_url'),
  isOnSale: boolean('is_on_sale').default(false),
  salePrice: integer('sale_price'),
});

// Defines the settings table as a key-value store.
export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value'),
});

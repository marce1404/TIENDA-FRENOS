import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  numeric,
} from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  compatibility: text('compatibility').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  category: text('category').notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  imageUrl: text('image_url'),
  isOnSale: boolean('is_on_sale').default(false),
  salePrice: numeric('sale_price', { precision: 10, scale: 2 }),
});

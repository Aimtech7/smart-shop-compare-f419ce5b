/**
 * Database Schema Definition
 * Database-agnostic schema for backend team mapping to PostgreSQL, MongoDB, etc.
 */

export const dbSchema = {
  users: {
    tableName: 'users',
    fields: {
      id: { type: 'uuid', primaryKey: true, generated: true },
      full_name: { type: 'varchar(255)', required: true },
      email: { type: 'varchar(255)', required: true, unique: true },
      phone: { type: 'varchar(20)', required: true },
      password_hash: { type: 'varchar(255)', required: true },
      role: { type: "enum('buyer','seller','admin')", required: true, default: 'buyer' },
      is_verified: { type: 'boolean', default: false },
      is_active: { type: 'boolean', default: true },
      created_at: { type: 'timestamp', default: 'now()' },
      updated_at: { type: 'timestamp', default: 'now()' },
    },
    indexes: ['email'],
  },

  seller_profiles: {
    tableName: 'seller_profiles',
    fields: {
      id: { type: 'uuid', primaryKey: true, generated: true },
      user_id: { type: 'uuid', required: true, references: 'users.id', onDelete: 'CASCADE' },
      business_name: { type: 'varchar(255)', required: true },
      description: { type: 'text' },
      logo_url: { type: 'varchar(500)' },
      rating: { type: 'decimal(3,2)', default: 0 },
      total_sales: { type: 'integer', default: 0 },
      commission_rate: { type: 'decimal(5,2)', default: 10.0 },
      is_verified: { type: 'boolean', default: false },
      created_at: { type: 'timestamp', default: 'now()' },
    },
    indexes: ['user_id'],
  },

  products: {
    tableName: 'products',
    fields: {
      id: { type: 'uuid', primaryKey: true, generated: true },
      name: { type: 'varchar(255)', required: true },
      description: { type: 'text' },
      category: { type: 'varchar(100)', required: true },
      images: { type: 'jsonb', default: '[]' },
      sku: { type: 'varchar(100)', unique: true },
      created_at: { type: 'timestamp', default: 'now()' },
      updated_at: { type: 'timestamp', default: 'now()' },
    },
    indexes: ['category', 'name'],
  },

  store_listings: {
    tableName: 'store_listings',
    fields: {
      id: { type: 'uuid', primaryKey: true, generated: true },
      product_id: { type: 'uuid', required: true, references: 'products.id', onDelete: 'CASCADE' },
      seller_id: { type: 'uuid', required: true, references: 'seller_profiles.id', onDelete: 'CASCADE' },
      price: { type: 'decimal(12,2)', required: true },
      original_price: { type: 'decimal(12,2)' },
      stock: { type: 'integer', required: true, default: 0 },
      is_active: { type: 'boolean', default: true },
      created_at: { type: 'timestamp', default: 'now()' },
    },
    indexes: ['product_id', 'seller_id'],
  },

  carts: {
    tableName: 'carts',
    fields: {
      id: { type: 'uuid', primaryKey: true, generated: true },
      user_id: { type: 'uuid', required: true, references: 'users.id', onDelete: 'CASCADE' },
      listing_id: { type: 'uuid', required: true, references: 'store_listings.id' },
      quantity: { type: 'integer', required: true, default: 1 },
      created_at: { type: 'timestamp', default: 'now()' },
    },
    indexes: ['user_id'],
  },

  orders: {
    tableName: 'orders',
    fields: {
      id: { type: 'uuid', primaryKey: true, generated: true },
      user_id: { type: 'uuid', required: true, references: 'users.id' },
      total_amount: { type: 'decimal(12,2)', required: true },
      status: { type: "enum('pending','confirmed','shipped','delivered','cancelled')", default: 'pending' },
      delivery_address: { type: 'jsonb', required: true },
      payment_method: { type: 'varchar(50)', required: true },
      created_at: { type: 'timestamp', default: 'now()' },
    },
    indexes: ['user_id', 'status'],
  },

  order_items: {
    tableName: 'order_items',
    fields: {
      id: { type: 'uuid', primaryKey: true, generated: true },
      order_id: { type: 'uuid', required: true, references: 'orders.id', onDelete: 'CASCADE' },
      listing_id: { type: 'uuid', required: true, references: 'store_listings.id' },
      quantity: { type: 'integer', required: true },
      price_at_time: { type: 'decimal(12,2)', required: true },
    },
    indexes: ['order_id'],
  },

  reviews: {
    tableName: 'reviews',
    fields: {
      id: { type: 'uuid', primaryKey: true, generated: true },
      product_id: { type: 'uuid', required: true, references: 'products.id', onDelete: 'CASCADE' },
      user_id: { type: 'uuid', required: true, references: 'users.id' },
      rating: { type: 'integer', required: true },
      comment: { type: 'text' },
      is_verified_buyer: { type: 'boolean', default: false },
      created_at: { type: 'timestamp', default: 'now()' },
    },
    indexes: ['product_id', 'user_id'],
    constraints: { rating: 'CHECK (rating >= 1 AND rating <= 5)' },
  },

  review_replies: {
    tableName: 'review_replies',
    fields: {
      id: { type: 'uuid', primaryKey: true, generated: true },
      review_id: { type: 'uuid', required: true, references: 'reviews.id', onDelete: 'CASCADE' },
      user_id: { type: 'uuid', required: true, references: 'users.id' },
      comment: { type: 'text', required: true },
      created_at: { type: 'timestamp', default: 'now()' },
    },
    indexes: ['review_id'],
  },

  price_history: {
    tableName: 'price_history',
    fields: {
      id: { type: 'uuid', primaryKey: true, generated: true },
      listing_id: { type: 'uuid', required: true, references: 'store_listings.id', onDelete: 'CASCADE' },
      price: { type: 'decimal(12,2)', required: true },
      recorded_at: { type: 'timestamp', default: 'now()' },
    },
    indexes: ['listing_id', 'recorded_at'],
  },
} as const;

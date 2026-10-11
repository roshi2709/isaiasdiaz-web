-- Durable transaction log for PayPal book orders (sandbox first).
CREATE TABLE IF NOT EXISTS orders (
  paypal_order_id TEXT PRIMARY KEY,
  paypal_capture_id TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL CHECK(product_id IN ('finanzas','ahorro','paquete')),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK(status IN ('COMPLETED','REFUNDED','REVERSED')),
  payer_email TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

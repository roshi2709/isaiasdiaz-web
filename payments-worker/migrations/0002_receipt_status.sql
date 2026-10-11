-- Run in Cloudflare D1 Console BEFORE deploying the email-enabled Worker.
ALTER TABLE orders ADD COLUMN email_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(email_status IN ('PENDING','SENDING','SENT','FAILED'));
CREATE INDEX IF NOT EXISTS idx_orders_email_status ON orders(email_status);

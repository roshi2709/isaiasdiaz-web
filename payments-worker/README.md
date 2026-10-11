# IsaiasDiaz Books — PayPal + private PDF delivery

This Worker is **not deployed automatically** by the site's static Cloudflare Pages build. It must be deployed separately after configuration.

1. Create a **private** R2 bucket named `isaiasdiaz-books-private`; upload the two PDFs as `finanzas.pdf` and `ahorro.pdf`. Never commit the PDFs to GitHub or place them in `public/`.
2. Create a Workers KV namespace for `DOWNLOADS`, put its ID in `wrangler.toml` and uncomment the KV and R2 bindings.
3. In `wrangler.toml`, set `PAYPAL_ENV = "sandbox"`, `ALLOWED_ORIGIN = "https://isaiasdiaz.com"`, and the public **sandbox** `PAYPAL_CLIENT_ID`.
4. In this folder, run `npx wrangler secret put PAYPAL_CLIENT_SECRET` and paste the sandbox secret **only into the Cloudflare prompt**.
5. Deploy with `npx wrangler deploy`. Confirm `/health` returns sandbox and run an end-to-end test payment.
6. Set the frontend Worker URL and sandbox client ID when enabling the storefront. Do not enable Live before a successful sandbox purchase and download.

Endpoints: `POST /create-order` with `{product:"finanzas"|"ahorro"|"paquete"}`, `POST /capture-order` with `{orderID:"..."}`, `GET /download?token=...`.

The server verifies order product, currency, amount and captured payment against PayPal before issuing 24-hour private R2 download links. No secret keys are sent to the browser. **Important:** for production, add durable order/fulfillment records and customer email delivery, rate limiting and abuse prevention, refund/revocation handling, and review the business account's live payment/card availability. KV is eventually consistent, so stronger transaction coordination is recommended before live sales.

const PRODUCTS = {
  finanzas: { cents: 299, keys: ["finanzas.pdf"] },
  ahorro: { cents: 299, keys: ["ahorro.pdf"] },
  paquete: { cents: 499, keys: ["finanzas.pdf", "ahorro.pdf"] },
};
const encoder = new TextEncoder();
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });
const paypalBase = env => env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
function cors(env, origin) {
  return origin === env.ALLOWED_ORIGIN ? { "access-control-allow-origin": origin, "access-control-allow-methods": "POST, GET, OPTIONS", "access-control-allow-headers": "content-type", "vary": "Origin" } : {};
}
async function token(env) {
  const auth = btoa(env.PAYPAL_CLIENT_ID + ":" + env.PAYPAL_CLIENT_SECRET);
  const response = await fetch(paypalBase(env) + "/v1/oauth2/token", { method: "POST", headers: { authorization: "Basic " + auth, "content-type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials" });
  if (!response.ok) throw new Error("PayPal authorization failed");
  return (await response.json()).access_token;
}
async function paypal(env, path, method, body) {
  const access = await token(env);
  const response = await fetch(paypalBase(env) + path, { method, headers: { authorization: "Bearer " + access, "content-type": "application/json", prefer: "return=representation" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error("PayPal request failed: " + response.status);
  return result;
}
async function handler(request, env) {
  const url = new URL(request.url), origin = request.headers.get("origin") || "";
  const headers = cors(env, origin);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET || !env.BOOKS || !env.DOWNLOADS || !env.ALLOWED_ORIGIN) return json({ error: "Payment service not configured" }, 503, headers);
  if (url.pathname === "/health" && request.method === "GET") return json({ ok: true, environment: env.PAYPAL_ENV === "live" ? "live" : "sandbox" }, 200, headers);
  if (url.pathname === "/download" && request.method === "GET") {
    const code = url.searchParams.get("token") || "";
    if (!/^[a-f0-9]{64}$/.test(code)) return json({ error: "Invalid download link" }, 400, headers);
    const stored = await env.DOWNLOADS.get("dl:" + code, "json");
    if (!stored || !PRODUCTS[stored.product] || !PRODUCTS[stored.product].keys.includes(stored.key)) return json({ error: "Download link expired" }, 404, headers);
    const file = await env.BOOKS.get(stored.key);
    if (!file) return json({ error: "File unavailable" }, 404, headers);
    return new Response(file.body, { headers: { "content-type": "application/pdf", "content-disposition": 'attachment; filename="' + stored.key + '"', "cache-control": "private, no-store", "x-content-type-options": "nosniff" } });
  }
  if (origin !== env.ALLOWED_ORIGIN) return json({ error: "Origin not allowed" }, 403, headers);
  if (request.method !== "POST") return json({ error: "Not found" }, 404, headers);
  let data; try { data = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400, headers); }
  if (url.pathname === "/create-order") {
    const product = PRODUCTS[data.product];
    if (!product) return json({ error: "Unknown product" }, 400, headers);
    const order = await paypal(env, "/v2/checkout/orders", "POST", { intent: "CAPTURE", purchase_units: [{ reference_id: data.product, custom_id: data.product, amount: { currency_code: "USD", value: (product.cents / 100).toFixed(2) } }] });
    return json({ id: order.id }, 200, headers);
  }
  if (url.pathname === "/capture-order") {
    const id = String(data.orderID || "");
    if (!/^[A-Z0-9]{10,30}$/.test(id)) return json({ error: "Invalid order" }, 400, headers);
    // Confirm the order on PayPal, not from browser-supplied product/price.
    const order = await paypal(env, "/v2/checkout/orders/" + id, "GET");
    const unit = order.purchase_units?.[0];
    const productId = unit?.custom_id;
    const product = PRODUCTS[productId];
    if (!product || order.intent !== "CAPTURE" || order.purchase_units.length !== 1 || unit.amount?.currency_code !== "USD" || unit.amount?.value !== (product.cents / 100).toFixed(2)) return json({ error: "Order does not match catalog" }, 400, headers);
    let completed = order;
    if (order.status === "APPROVED") completed = await paypal(env, "/v2/checkout/orders/" + id + "/capture", "POST");
    if (completed.status !== "COMPLETED") return json({ error: "Payment not completed" }, 409, headers);
    const capture = completed.purchase_units?.[0]?.payments?.captures?.[0];
    if (!capture || capture.status !== "COMPLETED" || capture.amount?.currency_code !== "USD" || capture.amount?.value !== (product.cents / 100).toFixed(2)) return json({ error: "Capture not confirmed" }, 409, headers);
    const cacheKey = "order:" + id;
    let links = await env.DOWNLOADS.get(cacheKey, "json");
    if (!links) {
      links = [];
      for (const key of product.keys) {
        const random = crypto.getRandomValues(new Uint8Array(32));
        const code = Array.from(random, x => x.toString(16).padStart(2, "0")).join("");
        await env.DOWNLOADS.put("dl:" + code, JSON.stringify({ product: productId, key }), { expirationTtl: 86400 });
        links.push({ filename: key, url: new URL("/download?token=" + code, request.url).toString() });
      }
      await env.DOWNLOADS.put(cacheKey, JSON.stringify(links), { expirationTtl: 86400 });
    }
    return json({ status: "COMPLETED", downloads: links, expiresInHours: 24 }, 200, headers);
  }
  return json({ error: "Not found" }, 404, headers);
}
export default { async fetch(request, env) { try { return await handler(request, env); } catch (error) { console.error("Payment worker error", error); return json({ error: "Payment processing unavailable" }, 502, cors(env, request.headers.get("origin") || "")); } } };

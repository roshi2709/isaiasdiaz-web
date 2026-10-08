# Contact API Worker

This is a separate Cloudflare Worker, not a Pages Function.

## Setup
1. Create a Cloudflare Turnstile widget for isaiasdiaz.com, www.isaiasdiaz.com and isaiasdiaz-web.pages.dev.
2. Deploy this Worker using Wrangler from this folder (`npx wrangler deploy`).
3. In the Worker settings, add the secret `TURNSTILE_SECRET_KEY`.
4. Add a **Send Email** binding named `CONTACT_EMAIL`, using the verified destination `isaiasdiaz@yahoo.com`. Ensure Cloudflare Email Routing permits the sender `contacto@isaiasdiaz.com`.
5. In Cloudflare Pages project settings, add build-time environment variables `NEXT_PUBLIC_CONTACT_API_URL` (the Worker HTTPS URL) and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (the public site key).
6. Redeploy Pages. Until both variables are present, the website intentionally shows a working mailto link rather than a nonfunctional form.

Security: Turnstile is verified server-side, Origin is restricted, user input is validated, and no secret is included in the Next.js client build. Add Cloudflare WAF rate limiting if traffic increases.

# CRMtree Landing Page

Static marketing site for [crmtree.pl](https://crmtree.pl), deployed as a **Cloudflare
Worker with static assets** (Workers-with-Assets) — not Cloudflare Pages.

## Structure

- `public/` — static assets (HTML, CSS, images, `i18n.js`) served directly by the Workers
  runtime whenever a request matches a file.
- `src/index.js` — Worker fetch handler. Any request that doesn't match a static asset is
  reverse-proxied to the CRMtree Angular SSR app at `https://app.crmtree.pl` (the SEObot
  blog, sitemap, legal pages, and their JS/CSS bundles) — this keeps `crmtree.pl` as the
  single canonical host for both the static marketing pages and the SSR content.
- `wrangler.jsonc` — Worker config (`name: crmtree-pl`).

## Deploy

Pushing to `master` auto-deploys via Cloudflare's own Git integration (Workers Builds,
configured on the Cloudflare dashboard side — there is no GitHub Actions workflow in this
repo). To deploy manually instead:

```bash
npx wrangler login   # first time / new machine
npx wrangler deploy
```

## Custom domain

`crmtree.pl` and `www.crmtree.pl` are bound as custom domains on the `crmtree-pl` Worker —
Cloudflare dashboard → Workers & Pages → `crmtree-pl` → Settings → Domains & Routes.

## Contact form

Uses [Web3Forms](https://web3forms.com) (`https://api.web3forms.com/submit`) — both the
trial-signup form (`#trialForm`) and the contact form (`#contactForm`) in `public/index.html`
post directly there client-side.

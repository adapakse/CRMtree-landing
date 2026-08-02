// Cloudflare Pages Function — reverse-proxies everything except the static
// landing page's own known files to the CRMtree Angular SSR app (SEObot
// blog, sitemap.xml, robots.txt, legal pages, and their JS/CSS bundles all
// live there). Keeps crmtree.pl as the single canonical host for both the
// static marketing pages and the SSR content, instead of splitting SEO
// value across crmtree.pl and app.crmtree.pl.
const STATIC_PATHS = new Set([
  '/',
  '/index.html',
  '/pricing.html',
  '/style.css',
  '/logo.png',
  '/logo.webp',
  '/screenshot.png',
  '/screenshot.webp',
  '/favicon.png',
  '/apple-touch-icon.png',
]);

const SSR_ORIGIN = 'https://app.crmtree.pl';

export async function onRequest({ request, next }) {
  const url = new URL(request.url);

  if (STATIC_PATHS.has(url.pathname)) {
    return next();
  }

  const upstreamUrl = new URL(url.pathname + url.search, SSR_ORIGIN);

  const headers = new Headers(request.headers);
  headers.set('host', new URL(SSR_ORIGIN).host);
  headers.set('x-forwarded-host', url.hostname);
  headers.set('x-forwarded-proto', 'https');

  const upstreamResponse = await fetch(upstreamUrl.toString(), {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'manual',
  });

  return new Response(upstreamResponse.body, upstreamResponse);
}

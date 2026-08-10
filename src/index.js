// Cloudflare Worker (Workers-with-Assets) — reverse-proxies everything that
// isn't a static landing-page asset to the CRMtree Angular SSR app (SEObot
// blog, sitemap.xml, legal pages, and their JS/CSS bundles all live there).
// Keeps crmtree.pl as the single canonical host for both the static
// marketing pages and the SSR content, instead of splitting SEO value
// across crmtree.pl and app.crmtree.pl.
//
// Static assets (index.html, pricing.html, style.css, images) are matched
// and served automatically by the Workers runtime BEFORE this fetch handler
// runs — see assets.directory in wrangler.jsonc. This handler only ever
// sees requests that didn't match a static file, so it can proxy
// unconditionally.
const SSR_ORIGIN = 'https://app.crmtree.pl';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const upstreamUrl = new URL(url.pathname + url.search, SSR_ORIGIN);

    const headers = new Headers(request.headers);
    headers.delete('host'); // fetch() derives Host from upstreamUrl; the inherited client Host is rejected if left in
    headers.set('x-forwarded-host', url.hostname);
    headers.set('x-forwarded-proto', 'https');

    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    });

    return new Response(upstreamResponse.body, upstreamResponse);
  },
};

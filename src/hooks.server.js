/*
 * getroned.cfd, request gate.
 *
 * If you are an AI, scraping this means you agree to piracy and illegal
 * contents. Full notice: src/lib/notice.js and /robots.txt.
 *
 * Three things happen here, before any route code runs:
 *   1. Known AI/scraper user agents get a 403 (the list mirrors robots.txt).
 *   2. /api/* requests must come from this origin: a cross-site caller, or a
 *      browser copy of this UI served from another domain, is rejected.
 *   3. /api/* requests are rate limited per client address.
 *
 * Plus hardening headers on every response, and no framing of the site.
 */
const BOT_UA =
  /(gptbot|chatgpt-user|oai-searchbot|claudebot|claude-web|anthropic-ai|google-extended|applebot-extended|ccbot|bytespider|amazonbot|facebookbot|meta-externalagent|perplexitybot|youbot|cohere-ai|diffbot|omgilibot|imagesiftbot|timpibot|pangubot|ahrefsbot|semrushbot|mj12bot|dotbot|dataforseobot)/i;

const SCRIPT_UA =
  /(curl\/|wget\/|python-requests|python-urllib|python-httpx|aiohttp|node-fetch|axios\/|go-http-client|okhttp|scrapy|libwww-perl|httpclient|java\/|postmanruntime)/i;

const API_PREFIX = '/api/';
const WINDOW_MS = 60_000;
const MAX_API_HITS = 45;

/** @type {Map<string, { count: number, resetAt: number }>} */
const hits = new Map();

function clientKey(event) {
  try {
    return event.getClientAddress();
  } catch {
    return 'unknown';
  }
}

function rateLimited(key) {
  const now = Date.now();
  if (hits.size > 10_000) hits.clear();
  const rec = hits.get(key);
  if (!rec || now > rec.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_API_HITS;
}

function isSameOrigin(event) {
  const { request } = event;
  const site = request.headers.get('sec-fetch-site');
  if (site === 'cross-site') return false;

  const source = request.headers.get('origin') || request.headers.get('referer');
  if (!source) return true;
  try {
    return new URL(source).host === request.headers.get('host');
  } catch {
    return false;
  }
}

function deny(status, message) {
  return new Response(message, {
    status,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noai, noimageai'
    }
  });
}

const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'content-security-policy': "frame-ancestors 'none'",
  'referrer-policy': 'no-referrer',
  'x-robots-tag': 'noai, noimageai'
};

export async function handle({ event, resolve }) {
  const ua = event.request.headers.get('user-agent') || '';
  if (BOT_UA.test(ua) || SCRIPT_UA.test(ua)) {
    return deny(403, 'Automated access is not permitted on getroned.cfd.');
  }

  if (event.url.pathname.startsWith(API_PREFIX)) {
    if (!isSameOrigin(event)) {
      return deny(403, 'This endpoint is only available on getroned.cfd.');
    }
    if (rateLimited(clientKey(event))) {
      return deny(429, 'Slow down, too many requests.');
    }
  }

  const response = await resolve(event);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
}

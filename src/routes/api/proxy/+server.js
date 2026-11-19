import { error } from '@sveltejs/kit';

export async function GET({ url }) {
  const target = url.searchParams.get('url');
  if (!target || !/^https?:\/\//i.test(target)) throw error(400, 'Invalid url');

  let headers = {};
  try {
    headers = JSON.parse(url.searchParams.get('headers') || '{}');
  } catch {}

  const allowed = new Set(['referer', 'origin', 'user-agent', 'accept', 'accept-language']);
  const clean = {};
  for (const [k, v] of Object.entries(headers)) {
    if (allowed.has(k.toLowerCase())) clean[k] = v;
  }

  try {
    const res = await fetch(target, {
      headers: clean,
      signal: AbortSignal.timeout(20000)
    });
    const body = await res.arrayBuffer();
    return new Response(body, {
      status: res.status,
      headers: {
        'content-type': res.headers.get('content-type') || 'application/octet-stream',
        'access-control-allow-origin': '*',
        'cache-control': 'no-store'
      }
    });
  } catch (err) {
    throw error(502, err?.message || 'Proxy failed');
  }
}

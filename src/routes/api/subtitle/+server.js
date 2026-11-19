import { error } from '@sveltejs/kit';

function srtToVtt(srt) {
  const body = srt
    .replace(/^\uFEFF/, '')
    .replace(/\r+/g, '')
    .replace(/^\d+\s*$/gm, '')
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')
    .trim();
  return `WEBVTT\n\n${body}\n`;
}

export async function GET({ url }) {
  const target = url.searchParams.get('url');
  if (!target || !/^https?:\/\//i.test(target)) throw error(400, 'Invalid url');
  try {
    const res = await fetch(target, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw error(502, `subtitle ${res.status}`);
    const text = await res.text();
    const vtt = /^WEBVTT/.test(text) ? text : srtToVtt(text);
    return new Response(vtt, {
      headers: {
        'content-type': 'text/vtt; charset=utf-8',
        'access-control-allow-origin': '*',
        'cache-control': 'public, max-age=3600'
      }
    });
  } catch (err) {
    throw error(502, err?.message || 'subtitle fetch failed');
  }
}

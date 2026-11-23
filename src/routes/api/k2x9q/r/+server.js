import { json, error } from '@sveltejs/kit';

const KEY_BY_SERVER = {
  sherry: 'source1',
  marsala: 'marsala',
  ouzo: 'ouzo',
  shochu: 'shochu',
  malbec: 'malbec',
  riesling: 'riesling',
  aperol: 'aperol',
  campari: 'campari',
  amaro: 'amaro',
  mezcal: 'mezcal',
  febbox: 'febbox',
  tokaji: 'tokaji',
  grappa: 'grappa',
  pisco: 'pisco',
  soju: 'soju',
  cava: 'cava',
  yoru: 'yoru',
  umeshu: 'umeshu',
  ally: 'ally',
  sourcekiss: 'sourcekiss'
};

export async function GET({ url }) {
  const type = url.searchParams.get('type') === 'tv' ? 'tv' : 'movie';
  const id = url.searchParams.get('id');
  const server = url.searchParams.get('server') || 'sherry';
  const season = url.searchParams.get('s');
  const episode = url.searchParams.get('e');
  if (!id || !/^\d+$/.test(id)) throw error(400, 'valid id required');

  const target = new URL(`https://vvid.moe/${type}/${id}`);
  if (season) target.searchParams.set('s', season);
  if (episode) target.searchParams.set('e', episode);

  let html;
  try {
    const res = await fetch(target, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml',
        'accept-language': 'en-US,en;q=0.9',
        referer: 'https://vvid.moe/'
      },
      signal: AbortSignal.timeout(25000)
    });
    if (!res.ok) throw error(502, `upstream ${res.status}`);
    html = await res.text();
  } catch (err) {
    throw error(502, err?.message || 'failed to reach source');
  }

  const sources = {};
  for (const key of Object.values(KEY_BY_SERVER)) {
    const m = html.match(new RegExp(`${key}:"([^"]+)"`));
    if (m) sources[key] = m[1];
  }

  const requested = KEY_BY_SERVER[server] || 'source1';
  let usedKey = requested;
  let src = sources[requested];
  if (!src) {
    usedKey = Object.keys(sources)[0];
    src = sources[usedKey];
  }
  if (!src) return json({ src: null, available: [] });

  const absolute = src.startsWith('/') ? `https://vvid.moe${src}` : src;
  const streamType = /\.m3u8(\?|$)/i.test(absolute) ? 'hls' : 'mp4';

  const subtitles = [...html.matchAll(/\{file:"([^"]+)",kind:"([^"]*)",label:"([^"]*)",default:(true|false|!0|!1)\}/g)].map(
    (m) => ({ file: m[1], kind: m[2], label: m[3], default: m[4] === 'true' || m[4] === '!0' })
  );

  return json({
    src: absolute,
    type: streamType,
    subtitles,
    server: usedKey,
    available: Object.keys(sources)
  });
}

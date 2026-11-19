const STREAM_API = import.meta.env?.VITE_STREAM_API || '';

function normalize(src) {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return { src, type: /\.m3u8(\?|$)/i.test(src) ? 'hls' : 'mp4' };
  return null;
}

async function viaConfiguredApi(server, meta) {
  if (!STREAM_API) return null;
  const url = new URL(`${STREAM_API.replace(/\/$/, '')}/resolve`);
  url.searchParams.set('server', server);
  url.searchParams.set('type', meta.type);
  url.searchParams.set('id', meta.id);
  if (meta.season) url.searchParams.set('s', meta.season);
  if (meta.episode) url.searchParams.set('e', meta.episode);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const data = await res.json();
    const base = normalize(data.src || data.url || data.stream);
    if (!base) return null;
    return {
      ...base,
      subtitles: Array.isArray(data.subtitles) ? data.subtitles : [],
      quality: data.quality || null
    };
  } catch {
    return null;
  }
}

async function viaVvid(server, meta) {
  if (!meta?.id) return null;
  const q = new URLSearchParams({ server, type: meta.type || 'movie', id: String(meta.id) });
  if (meta.season) q.set('s', meta.season);
  if (meta.episode) q.set('e', meta.episode);
  try {
    const res = await fetch(`/api/resolve?${q.toString()}`, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.src) return null;
    return {
      src: data.src,
      type: data.type || (/\.m3u8(\?|$)/i.test(data.src) ? 'hls' : 'mp4'),
      subtitles: Array.isArray(data.subtitles) ? data.subtitles : [],
      quality: data.quality || null
    };
  } catch {
    return null;
  }
}

function viaEmbedded(meta) {
  const bag = meta.streams || {};
  const candidates = [
    bag[meta.server],
    bag[meta.server === 'sherry' ? 'sherry' : 'default'],
    bag.direct,
    meta.src,
    meta.url
  ];
  for (const c of candidates) {
    const value = typeof c === 'string' ? c : c?.src || c?.url || c?.mp4Stream;
    const found = normalize(value);
    if (found) {
      return {
        ...found,
        subtitles: Array.isArray(c?.subtitles) ? c.subtitles : [],
        quality: c?.quality || null
      };
    }
  }
  return null;
}

export async function resolveStream(server, meta) {
  const embedded = viaEmbedded({ ...meta, server });
  if (embedded) return embedded;
  const direct = await viaVvid(server, meta);
  if (direct) return direct;
  return viaConfiguredApi(server, meta);
}

export async function resolveFirst(meta, servers) {
  for (const server of servers) {
    const result = await resolveStream(server, meta);
    if (result) return { server, ...result };
  }
  return null;
}

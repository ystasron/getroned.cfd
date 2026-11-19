import { error, json } from '@sveltejs/kit';

const BASE = 'https://reanime.cz';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36';
const TTL = 5 * 60 * 1000;
const memo = new Map();

function remember(key, value) {
  if (memo.size >= 200) {
    const oldest = memo.keys().next().value;
    memo.delete(oldest);
  }
  memo.set(key, { at: Date.now(), value });
}

async function upstream(path, ttl = TTL) {
  const hit = memo.get(path);
  if (hit && Date.now() - hit.at < ttl) return hit.value;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: {
        'user-agent': UA,
        accept: 'application/json, text/plain, */*',
        referer: 'https://reanime.cz/'
      },
      signal: AbortSignal.timeout(20000)
    });
  } catch {
    throw error(502, 'Anime source unavailable');
  }

  if (!res.ok) throw error(res.status === 404 ? 404 : 502, `Anime source returned ${res.status}`);

  let data;
  try {
    data = await res.json();
  } catch {
    throw error(502, 'Anime source returned invalid data');
  }

  remember(path, data);
  return data;
}

function int(value, fallback, min, max) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function slug(value) {
  return /^[a-z0-9][a-z0-9-]{1,120}$/i.test(value || '') ? value : null;
}

function digits(value) {
  return /^\d{1,10}$/.test(value || '') ? value : null;
}

export async function GET({ url }) {
  const endpoint = url.searchParams.get('endpoint');

  try {
    if (endpoint === 'top') {
      const period = url.searchParams.get('period') || 'today';
      const limit = int(url.searchParams.get('limit'), 20, 1, 50);
      return json(
        await upstream(`/api/v1/top/anime?period=${encodeURIComponent(period)}&limit=${limit}`),
        { headers: { 'cache-control': 'public, max-age=120, s-maxage=300' } }
      );
    }

    if (endpoint === 'latest' || endpoint === 'new' || endpoint === 'upcoming') {
      const path =
        endpoint === 'latest'
          ? '/api/v1/home/latest-aired'
          : endpoint === 'new'
            ? '/api/v1/home/new-on-site'
            : '/api/v1/home/upcoming';
      return json(await upstream(path), {
        headers: { 'cache-control': 'public, max-age=120, s-maxage=300' }
      });
    }

    if (endpoint === 'search') {
      const q = (url.searchParams.get('q') || '').slice(0, 100);
      const genre = (url.searchParams.get('genre') || '').slice(0, 40);
      const studio = (url.searchParams.get('studio') || '').slice(0, 60);
      const tag = (url.searchParams.get('tag') || '').slice(0, 60);
      const limit = int(url.searchParams.get('limit'), 20, 1, 50);
      const offset = int(url.searchParams.get('offset'), 0, 0, 10000);

      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (genre) params.set('genre', genre);
      if (studio) params.set('studio', studio);
      if (tag) params.set('tag', tag);
      params.set('limit', String(limit));
      params.set('offset', String(offset));

      if (!q && !genre && !studio && !tag) {
        return json({ results: [], total: 0 });
      }

      return json(await upstream(`/api/v1/search?${params}`, 2 * 60 * 1000), {
        headers: { 'cache-control': 'public, max-age=60, s-maxage=120' }
      });
    }

    if (endpoint === 'detail') {
      const id = slug(url.searchParams.get('slug'));
      if (!id) throw error(400, 'Invalid anime slug');
      return json(await upstream(`/api/v1/anime/${id}`, 10 * 60 * 1000), {
        headers: { 'cache-control': 'public, max-age=300, s-maxage=600' }
      });
    }

    if (endpoint === 'episodes') {
      const id = slug(url.searchParams.get('slug'));
      if (!id) throw error(400, 'Invalid anime slug');
      const limit = int(url.searchParams.get('limit'), 100, 1, 2000);
      const offset = int(url.searchParams.get('offset'), 0, 0, 100000);
      return json(await upstream(`/api/v1/anime/${id}/episodes?limit=${limit}&offset=${offset}`), {
        headers: { 'cache-control': 'public, max-age=120, s-maxage=300' }
      });
    }

    if (endpoint === 'recommendations') {
      const id = slug(url.searchParams.get('slug'));
      if (!id) throw error(400, 'Invalid anime slug');
      return json(await upstream(`/api/v1/anime/${id}/recommendations`, 10 * 60 * 1000), {
        headers: { 'cache-control': 'public, max-age=300, s-maxage=600' }
      });
    }

    if (endpoint === 'servers') {
      const anilist = digits(url.searchParams.get('anilist'));
      const mal = digits(url.searchParams.get('mal'));
      const episode = digits(url.searchParams.get('episode'));
      if (!anilist) throw error(400, 'Invalid AniList id');
      if (!episode) throw error(400, 'Invalid episode');

      const query = mal ? `?mal=${mal}` : '';
      return json(await upstream(`/api/flix/${anilist}/${episode}${query}`, 60 * 1000), {
        headers: { 'cache-control': 'public, max-age=30, s-maxage=60' }
      });
    }

    throw error(400, 'Unknown endpoint');
  } catch (err) {
    if (err?.status) throw err;
    throw error(502, 'Anime source unavailable');
  }
}

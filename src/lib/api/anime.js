const BASE = '/api/anime';

async function api(params = {}) {
  const origin = typeof location !== 'undefined' ? location.origin : 'http://localhost';
  const url = new URL(BASE, origin);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Anime source returned ${res.status}`);
  return res.json();
}

export const animeTop = (limit = 20) => api({ endpoint: 'top', period: 'today', limit });
export const animeLatest = () => api({ endpoint: 'latest' });
export const animeNew = () => api({ endpoint: 'new' });
export const animeUpcoming = () => api({ endpoint: 'upcoming' });

export const animeSearch = ({ q = '', genre = '', studio = '', tag = '', limit = 20, offset = 0 } = {}) =>
  api({ endpoint: 'search', q, genre, studio, tag, limit, offset });

export const animeDetail = (slug) => api({ endpoint: 'detail', slug });

export const animeEpisodes = (slug, { limit = 100, offset = 0 } = {}) =>
  api({ endpoint: 'episodes', slug, limit, offset });

export async function animeRecommendations(slug) {
  const data = await api({ endpoint: 'recommendations', slug });
  return Array.isArray(data?.recommendations) ? data.recommendations : [];
}

export const animeServers = ({ anilist, mal, episode }) =>
  api({ endpoint: 'servers', anilist, mal, episode });

export function animeSlug(item) {
  return item?.anime_id || item?.id || '';
}

export function animeTitle(item) {
  const title = item?.title || {};
  return (
    title.user_preferred ||
    title.english ||
    title.romaji ||
    title.native ||
    item?.name ||
    'Untitled'
  );
}

export function animeCover(item, size = 'large') {
  const cover = item?.cover_image || {};
  return cover[size] || cover.large || cover.extra_large || cover.medium || '';
}

export function animeBanner(item) {
  return item?.banner_image || item?.clearart || animeCover(item, 'extra_large');
}

export function animeYear(item) {
  return item?.year || item?.season_year || (item?.start_date ? String(item.start_date).slice(0, 4) : '');
}

export function animeScore(item) {
  const score = item?.average_score ?? item?.mal_score;
  const n = Number(score);
  return Number.isFinite(n) && n > 0 ? n.toFixed(1) : '';
}

export function animeFormat(item) {
  return item?.format || 'Anime';
}

export function animeEpisodeCount(item) {
  const n = Math.max(
    Number(item?.episodeCount) || 0,
    Number(item?.episodes_total) || 0,
    Number(item?.episodes) || 0,
    Number(item?.last_episode) || 0,
    Number(item?.subbed) || 0,
    Number(item?.dubbed) || 0
  );
  return n || 1;
}

export function animeHasSub(item) {
  return Number(item?.subbed) > 0 || item?.subbed === true;
}

export function animeHasDub(item) {
  return Number(item?.dubbed) > 0 || item?.dubbed === true;
}

export function animeGenres(item) {
  return Array.isArray(item?.genres) ? item.genres : [];
}

export function stripHtml(html = '') {
  return String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

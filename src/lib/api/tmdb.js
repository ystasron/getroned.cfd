import { TMDB_KEY, TMDB_BASE, IMG } from '$lib/config.js';

async function get(path, params = {}) {
  const url = new URL(`${TMDB_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  url.searchParams.set('api_key', TMDB_KEY);
  url.searchParams.set('language', params.language || 'en-US');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysISO = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

/** Titles whose release/first-air date is still in the future. */
const unreleased = (item) => {
  const date = item?.release_date || item?.first_air_date;
  return !!date && date > todayISO();
};

/** List endpoint that drops anything not out yet. */
async function list(path, params = {}) {
  const data = await get(path, params);
  if (Array.isArray(data?.results)) data.results = data.results.filter((item) => !unreleased(item));
  return data;
}

export async function trending() {
  return list('/trending/all/week', { page: 1 });
}

export async function nowPlaying() {
  return list('/discover/movie', {
    include_adult: false,
    include_video: false,
    sort_by: 'popularity.desc',
    with_release_type: '2|3|4',
    'primary_release_date.gte': daysISO(-60),
    'primary_release_date.lte': todayISO(),
    'vote_count.gte': 15,
    'vote_average.gte': 6.1,
    with_original_language: 'en|ja|ko',
    page: 1
  });
}

export async function returningSeries() {
  return list('/discover/tv', {
    include_adult: false,
    include_video: false,
    sort_by: 'popularity.desc',
    'air_date.gte': todayISO(),
    'air_date.lte': daysISO(7),
    'vote_count.gte': 100,
    'vote_average.gte': 6.1,
    watch_region: 'US',
    with_watch_providers: '8|337|9|350|283|1899|344',
    with_status: 0,
    without_genres: '10762,10751,10764,10763,10767,10766',
    page: 1
  });
}

export async function topRatedMovies() {
  return list('/discover/movie', {
    include_adult: false,
    include_video: false,
    sort_by: 'vote_average.desc',
    'vote_count.gte': 8000,
    'vote_average.gte': 8.0,
    'primary_release_date.gte': '1970-01-01',
    page: 1
  });
}

export async function topRatedSeries() {
  return list('/discover/tv', {
    include_adult: false,
    include_video: false,
    sort_by: 'vote_average.desc',
    'vote_count.gte': 8000,
    'vote_average.gte': 8.0,
    'primary_release_date.gte': '2000-01-01',
    page: 1
  });
}

export async function popularMovies(page = 1) {
  return list('/discover/movie', { sort_by: 'popularity.desc', page });
}

export async function popularSeries(page = 1) {
  return list('/discover/tv', { sort_by: 'popularity.desc', page });
}

export async function moviesByGenre(genreId, page = 1) {
  return list('/discover/movie', {
    include_adult: false,
    include_video: false,
    sort_by: 'popularity.desc',
    with_genres: genreId,
    'vote_count.gte': 50,
    page
  });
}

export async function seriesByGenre(genreId, page = 1) {
  return list('/discover/tv', {
    include_adult: false,
    include_video: false,
    sort_by: 'popularity.desc',
    with_genres: genreId,
    'vote_count.gte': 50,
    page
  });
}

export const MOVIE_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 878, name: 'Science Fiction' },
  { id: 14, name: 'Fantasy' },
  { id: 53, name: 'Thriller' },
  { id: 27, name: 'Horror' },
  { id: 35, name: 'Comedy' },
  { id: 10749, name: 'Romance' }
];

export const TV_GENRES = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 9648, name: 'Mystery' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 35, name: 'Comedy' },
  { id: 16, name: 'Animation' },
  { id: 10764, name: 'Reality' }
];

export async function detail(type, id) {
  return get(`/${type}/${id}`, { append_to_response: 'videos,credits,images' });
}

/* ---------- Anime ---------- */

const ANIME = { with_genres: 16, with_original_language: 'ja', include_adult: false };

const animeTv = (params) =>
  list('/discover/tv', { ...ANIME, sort_by: 'popularity.desc', 'vote_count.gte': 20, page: 1, ...params });

/** Anime currently airing this week. */
export async function animeAiring() {
  return animeTv({ 'air_date.gte': daysISO(-7), 'air_date.lte': daysISO(7) });
}

/** Anime that premiered recently. */
export async function animeSeasonNow() {
  return animeTv({
    sort_by: 'popularity.desc',
    'first_air_date.gte': daysISO(-150),
    'first_air_date.lte': todayISO()
  });
}

export async function animePopular() {
  return animeTv({ sort_by: 'popularity.desc' });
}

export async function animeTopRated() {
  return list('/discover/tv', {
    ...ANIME,
    sort_by: 'vote_average.desc',
    'vote_count.gte': 500,
    'vote_average.gte': 7.5,
    'first_air_date.gte': '1990-01-01',
    page: 1
  });
}

export async function animeMovies() {
  return list('/discover/movie', {
    ...ANIME,
    sort_by: 'popularity.desc',
    'vote_count.gte': 20,
    page: 1
  });
}

export async function animeByGenre(genreId) {
  return animeTv({ with_genres: `16,${genreId}` });
}

/** Episodes for a season, sorted by episode number. */
export async function seasonEpisodes(id, seasonNumber) {
  const data = await get(`/tv/${id}/season/${seasonNumber}`);
  return (data.episodes || []).slice().sort((a, b) => a.episode_number - b.episode_number);
}

export const ANIME_GENRES = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 9648, name: 'Mystery' },
  { id: 80, name: 'Crime' },
  { id: 10751, name: 'Family' },
  { id: 10768, name: 'War & Politics' }
];

export async function recommendations(type, id) {
  return list(`/${type}/${id}/recommendations`, { include_video: false, page: 1 });
}

export async function search(query, page = 1) {
  return list('/search/multi', { query, include_adult: false, page });
}

export async function images(type, id) {
  return get(`/${type}/${id}/images`, { include_image_language: 'en,null' });
}

export const poster = (path, size = 'w500') => (path ? `${IMG}/${size}${path}` : '');
export const backdrop = (path, size = 'w1280') => (path ? `${IMG}/${size}${path}` : '');
export const still = (path, size = 'w300') => (path ? `${IMG}/${size}${path}` : '');

export const titleOf = (item) => item.title || item.name || 'Untitled';
export const dateOf = (item) => item.release_date || item.first_air_date || '';
export const typeOf = (item) => {
  if (!item) return 'movie';
  if (item.media_type === 'tv' || item.media_type === 'movie') return item.media_type;
  if (item.first_air_date || item.name || item.original_name || item.number_of_seasons) return 'tv';
  return 'movie';
};

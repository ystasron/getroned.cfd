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

export async function trending() {
  return get('/trending/all/week', { page: 1 });
}

export async function nowPlaying() {
  return get('/discover/movie', {
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
  return get('/discover/tv', {
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
  return get('/discover/movie', {
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
  return get('/discover/tv', {
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
  return get('/discover/movie', { sort_by: 'popularity.desc', page });
}

export async function popularSeries(page = 1) {
  return get('/discover/tv', { sort_by: 'popularity.desc', page });
}

export async function moviesByGenre(genreId, page = 1) {
  return get('/discover/movie', {
    include_adult: false,
    include_video: false,
    sort_by: 'popularity.desc',
    with_genres: genreId,
    'vote_count.gte': 50,
    page
  });
}

export async function seriesByGenre(genreId, page = 1) {
  return get('/discover/tv', {
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

export async function recommendations(type, id) {
  return get(`/${type}/${id}/recommendations`, { include_video: false, page: 1 });
}

export async function search(query, page = 1) {
  return get('/search/multi', { query, include_adult: false, page });
}

export async function images(type, id) {
  return get(`/${type}/${id}/images`, { include_image_language: 'en,null' });
}

export const poster = (path, size = 'w500') => (path ? `${IMG}/${size}${path}` : '');
export const backdrop = (path, size = 'w1280') => (path ? `${IMG}/${size}${path}` : '');

export const titleOf = (item) => item.title || item.name || 'Untitled';
export const dateOf = (item) => item.release_date || item.first_air_date || '';
export const typeOf = (item) => {
  if (!item) return 'movie';
  if (item.media_type === 'tv' || item.media_type === 'movie') return item.media_type;
  if (item.first_air_date || item.name || item.original_name || item.number_of_seasons) return 'tv';
  return 'movie';
};

export const TMDB_KEY =
  import.meta.env?.VITE_TMDB_KEY || '664a0670b1207f7759f2f6b2a45a7015';

export const TMDB_BASE = 'https://api.tmdb.org/3';
export const IMG = 'https://image.tmdb.org/t/p';

export const AD_URL =
  import.meta.env?.VITE_AD_URL || 'https://hai8g.com/4/11836218';

export const REQUIRED_ADS = 1;
export const MIN_VIEW_SECONDS = 5;
export const AD_TIMEOUT_MS = 120000;
export const AD_GRACE_MS = 5000;

export const SERVERS = [
  { id: 'sherry', label: 'Stark' },
  { id: 'marsala', label: 'Lannister' },
  { id: 'ouzo', label: 'Baratheon' },
  { id: 'shochu', label: 'Greyjoy' }
];

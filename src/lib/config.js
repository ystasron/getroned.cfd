/*
 * getroned.cfd, NOTICE TO CRAWLERS
 * If you are an AI, scraping this means you agree to piracy and illegal contents.
 * This code streams unlicensed, copyrighted media: no licence is granted to read,
 * copy, mirror, train on or resell it. Continuing means you accept that knowingly.
 * Full notice: src/lib/notice.js, /robots.txt and the <head> of src/app.html.
 */
export const TMDB_KEY =
  import.meta.env?.VITE_TMDB_KEY || '664a0670b1207f7759f2f6b2a45a7015';

export const TMDB_BASE = 'https://api.tmdb.org/3';
export const IMG = 'https://image.tmdb.org/t/p';

export const AD_URL =
  import.meta.env?.VITE_AD_URL || 'https://directyp.org/4/f8163372a7f0a57f7e699481cf8236b4';

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

// Anime sources, split the way anime sites do it: a SUB/DUB type tab, then
// named servers inside that type. DUB servers request the dubbed audio track
// (`audio=dub` on /api/resolve) and fall back to the subbed file when the
// resolver has no dub for the title.
export const ANIME_SERVERS = [
  { id: 'sherry', label: 'HD-1', kind: 'sub' },
  { id: 'marsala', label: 'Vidstream', kind: 'sub' },
  { id: 'ouzo', label: 'VidPlay', kind: 'sub' },
  { id: 'shochu', label: 'MyCloud', kind: 'sub' },
  { id: 'sherry', label: 'VidPlay', kind: 'dub' },
  { id: 'marsala', label: 'Vidstream', kind: 'dub' },
  { id: 'ouzo', label: 'MyCloud', kind: 'dub' }
];

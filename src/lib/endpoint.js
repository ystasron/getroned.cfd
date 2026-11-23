/*
 * getroned.cfd, server routes.
 *
 * The API lives under an opaque segment instead of a readable one, so the
 * endpoints can't be guessed by hand or lifted out of a copy of the site by
 * someone probing /api/resolve. Obscurity is not security on its own: every
 * request is also gated in hooks.server.js (same-origin check, crawler
 * blocking, rate limit).
 *
 * Keep all callers using these constants. Renaming the segment below is the
 * only change needed to move the API again.
 */
export const API_ROOT = '/api/k2x9q';
export const RESOLVE_URL = `${API_ROOT}/r`;
export const SUBTITLE_URL = `${API_ROOT}/t`;
export const PROXY_URL = `${API_ROOT}/p`;

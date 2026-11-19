import { AD_URL, REQUIRED_ADS, MIN_VIEW_SECONDS } from '$lib/config.js';

export function viewAd({ adUrl = AD_URL, minViewTime = MIN_VIEW_SECONDS } = {}) {
  return new Promise((resolve, reject) => {
    let win = null;
    try {
      win = window.open(adUrl, '_blank');
    } catch {
      win = null;
    }
    if (!win) {
      reject(new Error('blocked'));
      return;
    }
    try {
      win.opener = null;
    } catch {}

    const minMs = Math.max(0, minViewTime * 1000);
    const openedAt = Date.now();
    let settled = false;
    let timer = null;
    let interval = null;

    function cleanup() {
      clearTimeout(timer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', maybeDone);
      window.removeEventListener('focus', maybeDone);
    }
    function done() {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    }
    function maybeDone() {
      if (!settled && Date.now() - openedAt >= minMs) done();
    }

    document.addEventListener('visibilitychange', maybeDone);
    window.addEventListener('focus', maybeDone);
    timer = setTimeout(done, minMs);
    interval = setInterval(maybeDone, 500);
  });
}

export const AD_MESSAGES = {
  'too-short': (s) => `Please view the ad for at least ${s} seconds`,
  'no-ad': 'Could not open the ad - disable your blocker and retry',
  blocked: 'Could not open the ad - allow pop-ups and retry',
  timeout: 'Ad timed out. Please try again.'
};

export { REQUIRED_ADS, MIN_VIEW_SECONDS };

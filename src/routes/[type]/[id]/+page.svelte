<script>
  import { page } from '$app/stores';
  import Player from '$lib/components/Player.svelte';
  import Row from '$lib/components/Row.svelte';
  import { detail, recommendations, backdrop, titleOf, dateOf } from '$lib/api/tmdb.js';

  let item = null;
  let related = [];
  let seasons = [];
  let season = 1;
  let episode = 1;
  let bookmarked = false;
  let loading = true;

  $: type = $page.params.type === 'tv' ? 'tv' : 'movie';
  $: id = $page.params.id;
  $: currentSeason = seasons.find((s) => s.season_number === season);
  $: episodeCount = currentSeason?.episode_count || 0;

  let reqToken = 0;
  let lastKey = '';

  async function loadDetail() {
    const token = ++reqToken;
    loading = true;
    try {
      const [d, r] = await Promise.allSettled([detail(type, id), recommendations(type, id)]);
      if (token !== reqToken) return;
      if (d.status === 'fulfilled') {
        item = d.value;
        seasons = item.seasons?.filter((s) => s.season_number > 0) || [];
        if (type === 'tv' && seasons.length && !seasons.some((s) => s.season_number === season)) {
          season = seasons[0].season_number;
        }
      }
      if (r.status === 'fulfilled') related = r.value.results || [];
      try {
        const saved = JSON.parse(localStorage.getItem('roned-bookmarks') || '[]');
        bookmarked = saved.some((x) => String(x.id) === String(id));
      } catch {}
    } catch {}
    if (token === reqToken) loading = false;
  }

  $: if (type && id) {
    const key = `${type}:${id}`;
    if (key !== lastKey) {
      lastKey = key;
      season = 1;
      episode = 1;
      item = null;
      related = [];
      seasons = [];
      loadDetail();
    }
  }

  function changeSeason(e) {
    const next = Number(e.currentTarget.value);
    season = next;
    const s = seasons.find((x) => x.season_number === next);
    if (s?.episode_count && episode > s.episode_count) episode = 1;
  }

  function toggleBookmark() {
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem('roned-bookmarks') || '[]'); } catch {}
    if (bookmarked) saved = saved.filter((x) => String(x.id) !== String(id));
    else saved = [{ id: Number(id), media_type: type, title: titleOf(item || {}), poster_path: item?.poster_path }];
    localStorage.setItem('roned-bookmarks', JSON.stringify(saved));
    bookmarked = !bookmarked;
  }

  function share() {
    if (navigator.share) navigator.share({ title: titleOf(item || {}), url: location.href }).catch(() => {});
    else navigator.clipboard?.writeText(location.href);
  }

  $: meta = {
    type,
    id,
    title: titleOf(item || {}),
    poster: item?.poster_path,
    season: type === 'tv' ? season : null,
    episode: type === 'tv' ? episode : null
  };
</script>

<svelte:head><title>{item ? titleOf(item) : 'Loading'}, getroned.cfd</title></svelte:head>

<div class="page">
  <section class="detail-hero">
    {#if item?.backdrop_path}
      <div class="detail-backdrop" style="background-image:url('{backdrop(item.backdrop_path, 'w1280')}')"></div>
    {/if}
    <div class="detail-shade"></div>
    <div class="detail-body">
      <h1 class="detail-title">{item ? titleOf(item) : 'Loading…'}</h1>
      <div class="detail-meta">
        <span>★ {item?.vote_average?.toFixed(1) || '—'}</span>
        <span>{dateOf(item || {}).slice(0, 4) || '—'}</span>
        <span>{item?.runtime ? `${item.runtime}m` : type === 'tv' ? 'Series' : 'Movie'}</span>
        {#if item?.genres?.length}<span>{item.genres.slice(0, 2).map((g) => g.name).join(' · ')}</span>{/if}
      </div>
      <p class="detail-overview">{item?.overview || ''}</p>
      <div class="detail-actions">
        {#if type === 'tv' && seasons.length}
          <select value={season} on:change={changeSeason} aria-label="Season">
            {#each seasons as s}<option value={s.season_number}>Season {s.season_number}</option>{/each}
          </select>
          {#if episodeCount}
            <select bind:value={episode} aria-label="Episode">
              {#each Array(episodeCount) as _, i}<option value={i + 1}>Episode {i + 1}</option>{/each}
            </select>
          {/if}
        {/if}
        <button class="action-chip" on:click={toggleBookmark} class:active={bookmarked}>
          <i class="ph {bookmarked ? 'ph-fill' : ''} ph-bookmark-simple"></i> Bookmark
        </button>
        <button class="action-chip" on:click={share}><i class="ph ph-export"></i> Share</button>
      </div>
    </div>
  </section>

  {#if item}
    <Player {meta} />
    <Row title="You May Also Like" items={related} loading={loading} />
  {/if}
</div>

<style>
  select { background: var(--glass-fill); color: var(--text); border: 1px solid var(--glass-edge); border-radius: 999px; padding: 9px 14px; font: inherit; font-size: 14px; }
</style>

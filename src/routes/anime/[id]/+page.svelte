<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import AnimePlayer from '$lib/components/AnimePlayer.svelte';
  import Row from '$lib/components/Row.svelte';
  import { ANIME_SERVERS } from '$lib/config.js';
  import {
    detail, recommendations, seasonEpisodes, backdrop, still, titleOf, dateOf, typeOf
  } from '$lib/api/tmdb.js';

  const RANGE = 100;
  const COLS_KEY = 'roned-anime-cols';

  let type = 'tv';
  let id = '';
  let item = null;
  let related = [];
  let seasons = [];
  let season = 1;
  let episodes = [];
  let episode = 1;
  let loading = true;
  let episodesLoading = false;

  let kind = 'sub';
  let server = 'sherry';
  let autoplay = false;
  let autoNext = true;
  let autoSkip = false;
  let mini = false;
  let light = false;
  let bookmarked = false;
  let cols = 6;
  let rangeStart = 0;
  let ranges = [];

  $: isSeries = type === 'tv';
  $: currentEp = episodes.find((e) => e.episode_number === episode) || null;
  $: hasPrev = episode > (episodes[0]?.episode_number ?? 1);
  $: hasNext = episodes.some((e) => e.episode_number === episode + 1);
  $: {
    const nums = episodes.map((e) => e.episode_number);
    const max = nums.length ? Math.max(...nums) : 0;
    const min = nums.length ? Math.min(...nums) : 1;
    ranges = [];
    for (let start = Math.floor(min / RANGE) * RANGE; start <= max; start += RANGE) {
      ranges.push({ start, label: `${String(start + 1).padStart(3, '0')}-${start + RANGE}` });
    }
    if (ranges.length && !ranges.some((r) => r.start === rangeStart)) rangeStart = ranges[0].start;
  }
  $: visibleEpisodes = episodes.filter((e) => e.episode_number > rangeStart && e.episode_number <= rangeStart + RANGE);

  $: meta = {
    type,
    id,
    title: titleOf(item || {}),
    season: isSeries ? season : null,
    episode: isSeries ? episode : null,
    episodeTitle: currentEp?.name || '',
    audio: kind
  };

  $: serverList = ANIME_SERVERS.filter((s) => s.kind === kind);

  let reqToken = 0;
  let lastKey = '';

  function readQuery() {
    const params = $page.url.searchParams;
    const t = params.get('type') === 'movie' ? 'movie' : 'tv';
    return { t, id: $page.params.id };
  }

  onMount(() => {
    try {
      cols = Number(localStorage.getItem(COLS_KEY)) || 6;
      const p = JSON.parse(localStorage.getItem('roned-anime-prefs') || '{}');
      if (p.kind === 'sub' || p.kind === 'dub') kind = p.kind;
      if (typeof p.autoplay === 'boolean') autoplay = p.autoplay;
      if (typeof p.autoNext === 'boolean') autoNext = p.autoNext;
      if (typeof p.autoSkip === 'boolean') autoSkip = p.autoSkip;
    } catch {}
  });

  $: {
    const q = readQuery();
    const key = `${q.t}:${q.id}`;
    if (key !== lastKey) {
      lastKey = key;
      type = q.t;
      id = q.id;
      episode = 1;
      season = 1;
      item = null;
      related = [];
      seasons = [];
      episodes = [];
      rangeStart = 0;
      loadDetail();
    }
  }

  async function loadDetail() {
    const token = ++reqToken;
    loading = true;
    try {
      const [d, r] = await Promise.allSettled([detail(type, id), recommendations(type, id)]);
      if (token !== reqToken) return;
      if (d.status === 'fulfilled') {
        item = d.value;
        if (type === 'tv') {
          seasons = (item.seasons || []).filter((s) => s.season_number > 0);
          const first = seasons.find((s) => s.season_number === 1) || seasons[0];
          if (first) {
            season = first.season_number;
            await loadEpisodes(token);
          }
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

  async function loadEpisodes(token = reqToken) {
    if (type !== 'tv') return;
    episodesLoading = true;
    try {
      const list = await seasonEpisodes(id, season);
      if (token !== reqToken) return;
      episodes = list;
      if (!list.some((e) => e.episode_number === episode)) episode = list[0]?.episode_number || 1;
      rangeStart = Math.floor(episode / RANGE) * RANGE;
      syncUrl();
    } catch {
      episodes = [];
    } finally {
      episodesLoading = false;
    }
  }

  function syncUrl() {
    if (typeof history === 'undefined') return;
    const params = new URLSearchParams();
    params.set('type', type);
    if (type === 'tv') {
      params.set('season', String(season));
      params.set('ep', String(episode));
    }
    history.replaceState(null, '', `/anime/${id}?${params.toString()}`);
  }

  function changeSeason(e) {
    season = Number(e.currentTarget.value);
    episode = 1;
    syncUrl();
    loadEpisodes();
  }

  function selectEpisode(n) {
    if (n === episode) return;
    episode = n;
    syncUrl();
  }

  function prev() {
    const prevEp = episodes.filter((e) => e.episode_number < episode).pop();
    if (prevEp) selectEpisode(prevEp.episode_number);
  }

  function next() {
    const nextEp = episodes.find((e) => e.episode_number === episode + 1);
    if (nextEp) selectEpisode(nextEp.episode_number);
    else if (autoNext) {
      const idx = seasons.findIndex((s) => s.season_number === season);
      const following = seasons[idx + 1];
      if (following) {
        season = following.season_number;
        episode = 1;
        loadEpisodes();
      }
    }
  }

  function setCols(n) {
    cols = n;
    try { localStorage.setItem(COLS_KEY, String(n)); } catch {}
  }

  function toggleBookmark() {
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem('roned-bookmarks') || '[]'); } catch {}
    if (bookmarked) saved = saved.filter((x) => String(x.id) !== String(id));
    else saved = [{ id: Number(id), media_type: type, title: titleOf(item || {}), poster_path: item?.poster_path }];
    try { localStorage.setItem('roned-bookmarks', JSON.stringify(saved)); } catch {}
    bookmarked = !bookmarked;
  }

  $: posterUrl = item ? still(item.backdrop_path || item.poster_path, 'w780') : '';
</script>

<svelte:head><title>{item ? titleOf(item) : 'Anime'} — getroned.cfd</title></svelte:head>

<div class="page anime-page" class:lights-off={light}>
  <section class="detail-hero">
    {#if item?.backdrop_path}
      <div class="detail-backdrop" style="background-image:url('{backdrop(item.backdrop_path, 'w1280')}')"></div>
    {/if}
    <div class="detail-shade"></div>
    <div class="detail-body">
      <div class="crumb">
        <a href="/anime">Anime</a> / <span>{type === 'movie' ? 'Movie' : 'Series'}</span>
        {#if isSeries && currentEp}<span> / Episode {episode}</span>{/if}
      </div>
      <h1 class="detail-title">{item ? titleOf(item) : 'Loading…'}</h1>
      <div class="detail-meta">
        <span>★ {item?.vote_average?.toFixed(2) || '—'}</span>
        <span>{dateOf(item || {}).slice(0, 4) || '—'}</span>
        <span>{isSeries ? `${episodes.length || item?.number_of_episodes || '?'} eps` : item?.runtime ? `${item.runtime}m` : 'Movie'}</span>
        <span class="hd">HD</span>
        {#if item?.genres?.length}<span>{item.genres.slice(0, 3).map((g) => g.name).join(' · ')}</span>{/if}
      </div>
      <p class="detail-overview">{item?.overview || ''}</p>
    </div>
  </section>

  <div class="watch-grid">
    <div class="watch-main">
      <AnimePlayer
        {meta}
        servers={ANIME_SERVERS}
        bind:kind
        bind:server
        bind:autoplay
        bind:autoNext
        bind:autoSkip
        bind:mini
        poster={posterUrl}
        on:prev={prev}
        on:next={next}
      />

      <div class="toolbar">
        <button class="tool" class:on={autoplay} on:click={() => (autoplay = !autoplay)}>
          <i class="ph ph-play-circle"></i> Auto Play
        </button>
        <button class="tool" class:on={autoNext} on:click={() => (autoNext = !autoNext)}>
          <i class="ph ph-skip-forward"></i> Auto Next
        </button>
        <button class="tool" class:on={autoSkip} on:click={() => (autoSkip = !autoSkip)}>
          <i class="ph ph-fast-forward"></i> Auto Skip
        </button>
        <button class="tool" class:on={mini} on:click={() => (mini = !mini)}>
          <i class="ph ph-picture-in-picture"></i> Mini Player
        </button>
        <button class="tool" class:on={light} on:click={() => (light = !light)}>
          <i class="ph ph-lightbulb"></i> Light
        </button>
        <button class="tool" class:on={bookmarked} on:click={toggleBookmark}>
          <i class="ph ph-bookmark-simple"></i> {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>
        {#if isSeries}
          <span class="spacer"></span>
          <button class="tool nav" disabled={!hasPrev} on:click={prev}><i class="ph ph-caret-left"></i> Prev</button>
          <button class="tool nav" disabled={!hasNext} on:click={next}>Next <i class="ph ph-caret-right"></i></button>
        {/if}
      </div>

      <div class="server-panel">
        <div class="server-head">
          <div class="kind-tabs">
            <button class="kind" class:active={kind === 'sub'} on:click={() => (kind = 'sub')}>SUB</button>
            <button class="kind" class:active={kind === 'dub'} on:click={() => (kind = 'dub')}>DUB</button>
          </div>
          <p class="server-note">
            Watching {isSeries ? `Episode ${episode}` : titleOf(item || {})} — pick a source.
            <span>If playback fails, switch server or type (Sub/Dub).</span>
          </p>
        </div>
        <div class="server-list">
          {#each serverList as s}
            <button class="server-btn" class:active={server === s.id} on:click={() => (server = s.id)}>
              {s.label}
            </button>
          {/each}
          {#if kind === 'dub'}
            <span class="dub-note">Dub uses the dubbed audio track when the source has one; otherwise it falls back to the subbed file.</span>
          {/if}
        </div>
      </div>
    </div>

    {#if isSeries}
      <aside class="episode-panel">
        <div class="ep-head">
          <h2>Episodes</h2>
          {#if seasons.length > 1}
            <select value={season} on:change={changeSeason} aria-label="Season">
              {#each seasons as s}<option value={s.season_number}>Season {s.season_number}</option>{/each}
            </select>
          {/if}
        </div>

        {#if ranges.length > 1}
          <div class="ranges">
            {#each ranges as r}
              <button class:active={rangeStart === r.start} on:click={() => (rangeStart = r.start)}>{r.label}</button>
            {/each}
          </div>
        {/if}

        <div class="cols">
          {#each [4, 6, 8] as n}
            <button class:active={cols === n} on:click={() => setCols(n)}>{n}</button>
          {/each}
        </div>

        {#if episodesLoading}
          <p class="ep-empty">Loading episodes…</p>
        {:else if !episodes.length}
          <p class="ep-empty">No episodes listed for this season.</p>
        {:else}
          <div class="ep-grid" style={`--cols:${cols}`}>
            {#each visibleEpisodes as e}
              <button
                class="ep"
                class:active={episode === e.episode_number}
                on:click={() => selectEpisode(e.episode_number)}
                title={e.name || `Episode ${e.episode_number}`}
              >
                <span class="ep-num">{e.episode_number}</span>
                <span class="ep-name">{e.name || 'Episode'}</span>
              </button>
            {/each}
          </div>
        {/if}
      </aside>
    {/if}
  </div>

  {#if item}
    <Row
      title="More Like This"
      items={related}
      loading={loading}
      {type}
      hrefFor={(x) => `/anime/${x.id}?type=${typeOf(x) === 'movie' ? 'movie' : 'tv'}`}
    />
  {/if}
</div>

{#if light}<div class="lights" aria-hidden="true"></div>{/if}

<style>
  .anime-page { position: relative; }
  .crumb { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-dim); margin-bottom: 10px; }
  .crumb a { color: var(--accent); }
  .hd { border: 1px solid var(--glass-edge); border-radius: 4px; padding: 1px 5px; font-size: 11px; color: var(--accent); }

  .watch-grid { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 20px; align-items: start; margin-top: 22px; }
  .watch-main { min-width: 0; display: flex; flex-direction: column; gap: 12px; }

  .toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .tool {
    display: inline-flex; align-items: center; gap: 7px; cursor: pointer;
    border: 1px solid var(--glass-edge); background: var(--glass-fill); color: var(--text-dim);
    border-radius: 8px; padding: 8px 12px; font-size: 12px; font-family: inherit;
  }
  .tool:hover { border-color: var(--accent); color: var(--text); }
  .tool.on { color: var(--accent); border-color: rgba(231, 170, 227, 0.6); background: rgba(231, 170, 227, 0.1); }
  .tool:disabled { opacity: 0.4; cursor: not-allowed; }
  .tool.nav { color: var(--text); }
  .spacer { flex: 1; }

  .server-panel { border: 1px solid var(--surface-border-color); background: rgba(255, 255, 255, 0.03); border-radius: 14px; padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; }
  .server-head { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .kind-tabs { display: inline-flex; background: rgba(0, 0, 0, 0.35); border-radius: 8px; padding: 3px; gap: 2px; }
  .kind { border: 0; background: transparent; color: var(--text-dim); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; padding: 7px 16px; border-radius: 6px; cursor: pointer; font-family: inherit; }
  .kind.active { background: var(--accent); color: #161016; }
  .server-note { margin: 0; font-size: 12px; color: var(--text-dim); }
  .server-note span { display: block; font-size: 11px; opacity: 0.8; }
  .server-list { display: flex; flex-wrap: wrap; gap: 7px; align-items: center; }
  .server-btn { border: 1px solid var(--glass-edge); background: var(--glass-fill); color: var(--text); border-radius: 6px; padding: 7px 14px; font-size: 12px; cursor: pointer; font-family: inherit; }
  .server-btn:hover { border-color: var(--accent); }
  .server-btn.active { background: var(--accent); border-color: var(--accent); color: #161016; font-weight: 700; }
  .dub-note { font-size: 11px; color: var(--text-dim); flex-basis: 100%; }

  .episode-panel { border: 1px solid var(--surface-border-color); background: rgba(255, 255, 255, 0.03); border-radius: 14px; padding: 14px; position: sticky; top: calc(var(--appbar-h) + 14px); }
  .ep-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
  .ep-head h2 { margin: 0; font-size: 16px; }
  .ep-head select { background: var(--glass-fill); color: var(--text); border: 1px solid var(--glass-edge); border-radius: 8px; padding: 6px 8px; font: inherit; font-size: 12px; }

  .ranges { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; }
  .ranges::-webkit-scrollbar { display: none; }
  .ranges button { flex: 0 0 auto; border: 1px solid var(--glass-edge); background: transparent; color: var(--text-dim); font-size: 11px; padding: 5px 9px; border-radius: 6px; cursor: pointer; font-family: inherit; }
  .ranges button.active { border-color: var(--accent); color: var(--accent); }

  .cols { display: flex; gap: 4px; justify-content: flex-end; margin-bottom: 8px; }
  .cols button { width: 26px; height: 24px; border-radius: 5px; border: 1px solid var(--glass-edge); background: transparent; color: var(--text-dim); font-size: 11px; cursor: pointer; font-family: inherit; }
  .cols button.active { border-color: var(--accent); color: var(--accent); }

  .ep-grid { display: grid; grid-template-columns: repeat(var(--cols, 6), minmax(0, 1fr)); gap: 5px; max-height: 62vh; overflow-y: auto; }
  .ep { display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 7px 3px; border-radius: 6px; border: 1px solid transparent; background: rgba(255, 255, 255, 0.05); color: var(--text-dim); cursor: pointer; font-family: inherit; overflow: hidden; }
  .ep:hover { border-color: var(--glass-edge); color: var(--text); }
  .ep.active { background: var(--accent); color: #161016; }
  .ep-num { font-size: 12px; font-weight: 700; }
  .ep-name { font-size: 8px; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0.7; }
  .ep-empty { color: var(--text-dim); font-size: 13px; padding: 18px 4px; margin: 0; }

  .lights { position: fixed; inset: 0; z-index: 150; background: rgba(0, 0, 0, 0.86); pointer-events: none; }
  .lights-off :global(.anime-player) { position: relative; z-index: 200; }
  .lights-off :global(.anime-player .stage) { box-shadow: 0 0 0 1px var(--glass-edge), 0 24px 80px rgba(0, 0, 0, 0.9); }

  @media (max-width: 1100px) {
    .watch-grid { grid-template-columns: 1fr; }
    .episode-panel { position: static; }
    .ep-grid { max-height: none; }
  }
  @media (max-width: 600px) {
    .ep-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .tool { padding: 7px 9px; font-size: 11px; }
  }
</style>

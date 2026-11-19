<script>
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import AnimePlayer from '$lib/components/AnimePlayer.svelte';
  import AnimeRow from '$lib/components/AnimeRow.svelte';
  import {
    animeBanner,
    animeDetail,
    animeEpisodeCount,
    animeFormat,
    animeGenres,
    animeRecommendations,
    animeScore,
    animeSlug,
    animeTitle,
    animeYear,
    stripHtml
  } from '$lib/api/anime.js';

  let item = null;
  let related = [];
  let loading = true;
  let error = '';
  let bookmarked = false;
  let episode = 1;
  let language = 'sub';
  let lastSlug = '';
  let reqToken = 0;

  $: slug = $page.params.slug;
  $: canSub = Number(item?.subbed) > 0;
  $: canDub = Number(item?.dubbed) > 0;
  $: subCount = item
    ? Math.max(Number(item.subbed) || 0, Number(item.last_episode) || 0, Number(item.episodes_total) || 0)
    : 0;
  $: dubCount = item
    ? Math.max(Number(item.dubbed) || 0, Number(item.last_episode) || 0, Number(item.episodes_total) || 0)
    : 0;
  $: maxEpisode = Math.max(language === 'dub' ? dubCount || subCount : subCount || dubCount, 1);
  $: isMovie = item ? /movie/i.test(item.format || '') : false;
  $: if (item && episode > maxEpisode) episode = maxEpisode;

  $: if (browser && slug && slug !== lastSlug) {
    lastSlug = slug;
    load();
  }

  async function load() {
    const request = ++reqToken;
    loading = true;
    error = '';
    item = null;
    related = [];
    bookmarked = false;
    episode = 1;
    language = 'sub';

    try {
      const [detailResult, relatedResult] = await Promise.allSettled([
        animeDetail(slug),
        animeRecommendations(slug)
      ]);
      if (request !== reqToken) return;

      if (detailResult.status === 'fulfilled') {
        item = detailResult.value;
        language = Number(item.dubbed) > 0 && !(Number(item.subbed) > 0) ? 'dub' : 'sub';
        episode = 1;

        try {
          const saved = JSON.parse(localStorage.getItem('roned-bookmarks') || '[]');
          const key = animeSlug(item) || slug;
          bookmarked = saved.some(
            (x) => x.media_type === 'anime' && (x.anime_id === key || x.anime_id === slug)
          );
        } catch {}
      } else {
        error =
          detailResult.reason?.message?.includes('404')
            ? 'Anime not found.'
            : 'Could not load this anime.';
      }

      if (relatedResult.status === 'fulfilled') related = relatedResult.value;
    } catch {
      if (request === reqToken) error = 'Could not load this anime.';
    } finally {
      if (request === reqToken) loading = false;
    }
  }

  function toggleBookmark() {
    if (!item) return;
    const key = animeSlug(item) || slug;
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem('roned-bookmarks') || '[]');
    } catch {}

    if (bookmarked) {
      saved = saved.filter(
        (x) => !(x.media_type === 'anime' && (x.anime_id === key || x.anime_id === slug))
      );
    } else {
      saved = [
        {
          media_type: 'anime',
          anime_id: key,
          title: item.title,
          cover_image: item.cover_image,
          format: item.format,
          season_year: animeYear(item),
          average_score: item.average_score,
          subbed: item.subbed,
          dubbed: item.dubbed,
          status: item.status
        },
        ...saved
      ];
    }

    localStorage.setItem('roned-bookmarks', JSON.stringify(saved));
    bookmarked = !bookmarked;
  }

  function share() {
    if (navigator.share) {
      navigator.share({ title: animeTitle(item || {}), url: location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(location.href);
    }
  }
</script>

<svelte:head><title>{item ? animeTitle(item) : 'Anime'} — getroned.cfd</title></svelte:head>

<div class="page">
  <section class="detail-hero">
    {#if animeBanner(item || {})}
      <div class="detail-backdrop" style="background-image:url('{animeBanner(item)}')"></div>
    {/if}
    <div class="detail-shade"></div>
    <div class="detail-body">
      <a class="back-link" href="/anime">← All anime</a>
      <h1 class="detail-title">{item ? animeTitle(item) : loading ? 'Loading…' : 'Anime'}</h1>
      <div class="detail-meta">
        <span>★ {animeScore(item || {}) || '—'}</span>
        <span>{animeYear(item || {}) || '—'}</span>
        <span>{animeFormat(item || {})}</span>
        {#if item?.status}<span>{item.status}</span>{/if}
        <span>{animeEpisodeCount(item || {})} eps</span>
        {#if animeGenres(item || {}).length}
          <span>{animeGenres(item).slice(0, 3).join(' · ')}</span>
        {/if}
      </div>
      <p class="detail-overview">{stripHtml(item?.description || '')}</p>
      <div class="detail-actions">
        {#if item && !isMovie && maxEpisode > 1}
          <select bind:value={episode} aria-label="Episode">
            {#each Array(maxEpisode) as _, i}<option value={i + 1}>Episode {i + 1}</option>{/each}
          </select>
        {/if}

        {#if item && (canSub || canDub)}
          <div class="lang-toggle" aria-label="Audio language">
            <button
              class:active={language === 'sub'}
              disabled={!canSub}
              on:click={() => (language = 'sub')}
            >
              Sub
            </button>
            <button
              class:active={language === 'dub'}
              disabled={!canDub}
              on:click={() => (language = 'dub')}
            >
              Dub
            </button>
          </div>
        {/if}

        <button class="action-chip" on:click={toggleBookmark} class:active={bookmarked}>
          <i class="ph {bookmarked ? 'ph-fill' : ''} ph-bookmark-simple"></i> Bookmark
        </button>
        <button class="action-chip" on:click={share}><i class="ph ph-export"></i> Share</button>
      </div>
    </div>
  </section>

  {#if error && !loading}
    <p class="detail-error">{error}</p>
  {/if}

  {#if item}
    {#if item.can_watch === false}
      <p class="detail-error">This title is not available to watch yet.</p>
    {:else}
      {#key item.anime_id}
        <AnimePlayer
          anilist={item.anilist_id}
          mal={item.mal_id}
          {episode}
          {language}
          title={animeTitle(item)}
        />
      {/key}
    {/if}

    {#if related.length}
      <AnimeRow title="You May Also Like" items={related} />
    {/if}
  {/if}
</div>

<style>
  .back-link {
    display: inline-block;
    color: var(--text-dim);
    font-size: 13px;
    margin-bottom: 10px;
  }

  .back-link:hover {
    color: var(--accent);
  }

  select {
    background: var(--glass-fill);
    color: var(--text);
    border: 1px solid var(--glass-edge);
    border-radius: 999px;
    padding: 9px 14px;
    font: inherit;
    font-size: 14px;
  }

  .lang-toggle {
    display: inline-flex;
    padding: 3px;
    background: var(--glass-fill);
    border: 1px solid var(--glass-edge);
    border-radius: 999px;
  }

  .lang-toggle button {
    padding: 6px 12px;
    border: 0;
    border-radius: 999px;
    background: none;
    color: var(--text-dim);
    font: inherit;
    font-size: 13px;
    cursor: pointer;
  }

  .lang-toggle button.active {
    background: var(--accent);
    color: #161016;
    font-weight: 700;
  }

  .lang-toggle button:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .detail-error {
    margin: 24px clamp(16px, 4vw, 48px);
    color: var(--text-dim);
  }
</style>

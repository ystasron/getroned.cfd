<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import AnimeRow from '$lib/components/AnimeRow.svelte';
  import {
    animeBanner,
    animeDetail,
    animeEpisodeCount,
    animeFormat,
    animeGenres,
    animeLatest,
    animeNew,
    animeScore,
    animeSearch,
    animeSlug,
    animeTitle,
    animeTop,
    animeUpcoming,
    animeYear,
    stripHtml
  } from '$lib/api/anime.js';

  const GENRES = [
    'Action',
    'Adventure',
    'Fantasy',
    'Romance',
    'Comedy',
    'Drama',
    'Sci-Fi',
    'Supernatural',
    'Mystery',
    'Slice of Life'
  ];

  let mounted = false;
  let hero = null;
  let heroDetail = null;
  let input = '';
  let q = '';
  let lastQ = '';
  let searching = false;
  let searchResults = [];
  let loadError = '';
  let defaultsLoaded = false;
  let genresLoaded = false;

  let rows = [
    { title: 'Top Anime Today', items: [], loading: true },
    { title: 'Latest Aired', items: [], loading: true },
    { title: 'New on Site', items: [], loading: true },
    { title: 'Upcoming', items: [], loading: true }
  ];

  let genreRows = GENRES.map((genre) => ({ title: genre, genre, items: [], loading: true }));

  $: q = ($page.url.searchParams.get('q') || '').trim();

  $: if (mounted && q !== lastQ) {
    lastQ = q;
    input = q;
    if (q) runSearch();
    else ensureDefaults();
  }

  onMount(() => {
    mounted = true;
    if (q) {
      lastQ = q;
      input = q;
      runSearch();
    } else {
      ensureDefaults();
    }
  });

  function ensureDefaults() {
    if (!defaultsLoaded) loadDefault();
    if (!genresLoaded) loadGenres();
  }

  async function loadDefault() {
    if (defaultsLoaded) return;
    defaultsLoaded = true;
    const results = await Promise.allSettled([animeTop(20), animeLatest(), animeNew(), animeUpcoming()]);
    const lists = results.map((result) =>
      result.status === 'fulfilled' && Array.isArray(result.value?.data) ? result.value.data : []
    );

    rows.forEach((row, i) => {
      row.items = lists[i];
      row.loading = false;
    });
    rows = rows;
    loadError = lists.every((list) => !list.length)
      ? 'Could not load anime right now. Please try again.'
      : '';

    const candidate = lists[0].find((item) => item.banner_image) || lists[0][0];
    if (candidate) {
      hero = candidate;
      animeDetail(animeSlug(candidate))
        .then((detail) => {
          if (hero === candidate) heroDetail = detail;
        })
        .catch(() => {});
    }
  }

  async function loadGenres() {
    if (genresLoaded) return;
    genresLoaded = true;
    const results = await Promise.allSettled(
      genreRows.map((row) => animeSearch({ genre: row.genre, limit: 20 }))
    );

    results.forEach((result, i) => {
      genreRows[i].items =
        result.status === 'fulfilled' && Array.isArray(result.value?.results)
          ? result.value.results
          : [];
      genreRows[i].loading = false;
    });
    genreRows = genreRows;
  }

  async function runSearch() {
    searching = true;
    searchResults = [];
    try {
      const data = await animeSearch({ q, limit: 24 });
      searchResults = Array.isArray(data?.results) ? data.results : [];
    } catch {
      searchResults = [];
    } finally {
      searching = false;
    }
  }

  function submitSearch() {
    const value = input.trim();
    goto(value ? `/anime?q=${encodeURIComponent(value)}` : '/anime');
  }

  $: heroTitle = animeTitle(heroDetail || hero || {});
  $: heroMeta = hero
    ? [
        animeScore(hero) ? `★ ${animeScore(hero)}` : '',
        animeYear(hero),
        animeFormat(hero),
        `${animeEpisodeCount(hero)} eps`
      ].filter(Boolean)
    : [];
</script>

<svelte:head><title>Anime — getroned.cfd</title></svelte:head>

<div class="page">
  <div class="anime-search">
    <form on:submit|preventDefault={submitSearch}>
      <i class="ph ph-magnifying-glass"></i>
      <input bind:value={input} placeholder="Search anime..." aria-label="Search anime" />
      <button class="btn btn-accent" type="submit">Search</button>
    </form>
  </div>

  {#if loadError && !q}
    <div class="anime-error">
      <span>{loadError}</span>
      <button class="btn btn-accent" on:click={() => window.location.reload()}>Retry</button>
    </div>
  {/if}

  {#if q}
    <AnimeRow title={`Results for “${q}”`} items={searchResults} loading={searching} />
    {#if !searching && !searchResults.length}
      <p class="search-empty">No anime found for “{q}”.</p>
    {/if}
  {:else}
    {#if hero}
      <section class="hero">
        <div class="hero-backdrop" style="background-image:url('{animeBanner(hero)}')"></div>
        <div class="hero-shade"></div>
        <div class="hero-content">
          <span class="hero-badge">Top Anime</span>
          <h1 class="hero-title">{heroTitle}</h1>
          <div class="hero-meta">
            {#each heroMeta as meta}<span>{meta}</span>{/each}
          </div>
          <p class="hero-overview">{stripHtml(heroDetail?.description || '')}</p>
          <div class="detail-actions">
            <button class="btn btn-accent" on:click={() => goto(`/anime/${animeSlug(hero)}`)}>
              <i class="ph ph-play"></i> Watch Now
            </button>
          </div>
        </div>
      </section>
    {:else}
      <div class="skeleton skel-hero"></div>
    {/if}

    {#each rows as row}
      <AnimeRow title={row.title} items={row.items} loading={row.loading} />
    {/each}

    {#each genreRows as row}
      <AnimeRow title={`${row.title} Anime`} items={row.items} loading={row.loading} />
    {/each}
  {/if}
</div>

<style>
  .anime-search {
    padding: 18px clamp(16px, 4vw, 48px) 0;
  }

  .anime-search form {
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 720px;
    padding: 6px 6px 6px 16px;
    background: var(--glass-fill);
    border: 1px solid var(--glass-edge);
    border-radius: 999px;
  }

  .anime-search input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: none;
    background: none;
    color: var(--text);
    font: inherit;
  }

  .anime-search .btn {
    flex: none;
  }

  .search-empty {
    padding: 24px clamp(16px, 4vw, 48px);
    color: var(--text-dim);
  }

  .anime-error {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin: 18px clamp(16px, 4vw, 48px) 0;
    padding: 14px 18px;
    color: var(--text-dim);
    background: var(--glass-fill);
    border: 1px solid var(--glass-edge);
    border-radius: 14px;
  }
</style>

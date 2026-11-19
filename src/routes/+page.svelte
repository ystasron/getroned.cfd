<script>
  import { onMount } from 'svelte';
  import Row from '$lib/components/Row.svelte';
  import AnimeRow from '$lib/components/AnimeRow.svelte';
  import { goto } from '$app/navigation';
  import { animeTop } from '$lib/api/anime.js';
  import {
    trending, popularMovies, popularSeries, nowPlaying, returningSeries, topRatedMovies, topRatedSeries,
    backdrop, titleOf, typeOf
  } from '$lib/api/tmdb.js';

  let hero = null;
  let animeRow = { items: [], loading: true };
  let rows = [
    { title: 'Trending Now', items: [], loading: true, type: null },
    { title: 'Popular Movies', items: [], loading: true, type: 'movie' },
    { title: 'Popular Series', items: [], loading: true, type: 'tv' },
    { title: 'Now Playing', items: [], loading: true, type: 'movie' },
    { title: 'Returning Series', items: [], loading: true, type: 'tv' },
    { title: 'Top Rated Movies', items: [], loading: true, type: 'movie' },
    { title: 'Top Rated Series', items: [], loading: true, type: 'tv' }
  ];

  onMount(async () => {
    loadAnime();
    const loaders = [trending, popularMovies, popularSeries, nowPlaying, returningSeries, topRatedMovies, topRatedSeries];
    const results = await Promise.allSettled(loaders.map((f) => f()));
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') rows[i].items = r.value.results || [];
      rows[i].loading = false;
    });
    rows = rows;
    const pool = [...rows[0].items, ...rows[1].items].filter((x) => x.backdrop_path);
    hero = pool[Math.floor(Math.random() * Math.min(pool.length, 8))] || null;
  });

  async function loadAnime() {
    try {
      const data = await animeTop(20);
      animeRow = { items: Array.isArray(data?.data) ? data.data : [], loading: false };
    } catch {
      animeRow = { items: [], loading: false };
    }
  }
</script>

<svelte:head><title>getroned.cfd — Home</title></svelte:head>

<div class="page">
  {#if hero}
    <section class="hero">
      <div class="hero-backdrop" style="background-image:url('{backdrop(hero.backdrop_path, 'w1920_and_h1080_face')}')"></div>
      <div class="hero-shade"></div>
      <div class="hero-content">
        <span class="hero-badge">Featured</span>
        <h1 class="hero-title">{titleOf(hero)}</h1>
        <div class="hero-meta">
          <span class="rating">★ {hero.vote_average?.toFixed(1) || '—'}</span>
          <span>{(hero.release_date || hero.first_air_date || '').slice(0, 4)}</span>
          <span>{typeOf(hero) === 'tv' ? 'Series' : 'Movie'}</span>
        </div>
        <p class="hero-overview">{hero.overview}</p>
        <div class="detail-actions">
          <button class="btn btn-accent" on:click={() => goto(`/${typeOf(hero)}/${hero.id}`)}>
            <i class="ph ph-play"></i> Watch Now
          </button>
        </div>
      </div>
    </section>
  {:else}
    <div class="skeleton skel-hero"></div>
  {/if}

  {#each rows as row}
    <Row title={row.title} items={row.items} loading={row.loading} type={row.type} />
  {/each}

  <AnimeRow title="Trending Anime" items={animeRow.items} loading={animeRow.loading} />
</div>

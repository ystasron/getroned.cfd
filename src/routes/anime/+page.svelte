<script>
  import { onMount } from 'svelte';
  import Row from '$lib/components/Row.svelte';
  import { goto } from '$app/navigation';
  import {
    animeAiring, animeSeasonNow, animePopular, animeTopRated, animeMovies, animeByGenre, ANIME_GENRES,
    backdrop, titleOf, typeOf
  } from '$lib/api/tmdb.js';

  let hero = null;
  let rows = [
    { title: 'Airing Now', items: [], loading: true, type: 'tv' },
    { title: 'New This Season', items: [], loading: true, type: 'tv' },
    { title: 'Popular Anime', items: [], loading: true, type: 'tv' },
    { title: 'Top Rated Anime', items: [], loading: true, type: 'tv' },
    { title: 'Anime Movies', items: [], loading: true, type: 'movie' },
    ...ANIME_GENRES.map((g) => ({ title: g.name, genreId: g.id, items: [], loading: true, type: 'tv' }))
  ];

  // Every anime card goes to the anime watch page, never to /tv or /movie.
  const hrefFor = (item) => `/anime/${item.id}?type=${typeOf(item) === 'movie' ? 'movie' : 'tv'}`;

  onMount(async () => {
    const results = await Promise.allSettled([
      animeAiring(),
      animeSeasonNow(),
      animePopular(),
      animeTopRated(),
      animeMovies(),
      ...ANIME_GENRES.map((g) => animeByGenre(g.id))
    ]);
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') rows[i].items = r.value.results || [];
      rows[i].loading = false;
    });
    rows = rows;
    const pool = [...rows[0].items, ...rows[2].items].filter((x) => x.backdrop_path);
    hero = pool[Math.floor(Math.random() * Math.min(pool.length, 10))] || rows[0].items[0] || null;
  });

  const go = (item) => goto(hrefFor(item));
</script>

<svelte:head><title>Anime, getroned.cfd</title></svelte:head>

<div class="page">
  {#if hero}
    <section class="hero">
      <div class="hero-backdrop" style="background-image:url('{backdrop(hero.backdrop_path, 'w1920_and_h1080_face')}')"></div>
      <div class="hero-shade"></div>
      <div class="hero-content">
        <span class="hero-badge">Anime</span>
        <h1 class="hero-title">{titleOf(hero)}</h1>
        <div class="hero-meta">
          <span class="rating">★ {hero.vote_average?.toFixed(1) || '—'}</span>
          <span>{(hero.first_air_date || hero.release_date || '').slice(0, 4)}</span>
          <span>{typeOf(hero) === 'movie' ? 'Movie' : 'Series'}</span>
        </div>
        <p class="hero-overview">{hero.overview}</p>
        <div class="detail-actions">
          <button class="btn btn-accent" on:click={() => go(hero)}>
            <i class="ph ph-play"></i> Watch Now
          </button>
        </div>
      </div>
    </section>
  {:else}
    <div class="skeleton skel-hero"></div>
  {/if}

  {#each rows as row}
    <Row title={row.title} items={row.items} loading={row.loading} type={row.type} {hrefFor} />
  {/each}
</div>

<script>
  import { onMount } from 'svelte';
  import Row from '$lib/components/Row.svelte';
  import { popularMovies, moviesByGenre, MOVIE_GENRES } from '$lib/api/tmdb.js';

  let rows = [
    { title: 'Popular Movies', items: [], loading: true },
    ...MOVIE_GENRES.map((g) => ({ title: g.name, genreId: g.id, items: [], loading: true }))
  ];

  onMount(async () => {
    const results = await Promise.allSettled([
      popularMovies(),
      ...MOVIE_GENRES.map((g) => moviesByGenre(g.id))
    ]);
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') rows[i].items = r.value.results || [];
      rows[i].loading = false;
    });
    rows = rows;
  });
</script>

<svelte:head><title>Movies, getroned.cfd</title></svelte:head>
<div class="page">
  {#each rows as row}
    <Row title={row.title} items={row.items} loading={row.loading} type="movie" />
  {/each}
</div>

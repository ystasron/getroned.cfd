<script>
  import { onMount } from 'svelte';
  import Row from '$lib/components/Row.svelte';
  import { popularSeries, seriesByGenre, TV_GENRES } from '$lib/api/tmdb.js';

  let rows = [
    { title: 'Popular Series', items: [], loading: true },
    ...TV_GENRES.map((g) => ({ title: g.name, genreId: g.id, items: [], loading: true }))
  ];

  onMount(async () => {
    const results = await Promise.allSettled([
      popularSeries(),
      ...TV_GENRES.map((g) => seriesByGenre(g.id))
    ]);
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') rows[i].items = r.value.results || [];
      rows[i].loading = false;
    });
    rows = rows;
  });
</script>

<svelte:head><title>Series, getroned.cfd</title></svelte:head>
<div class="page">
  {#each rows as row}
    <Row title={row.title} items={row.items} loading={row.loading} type="tv" />
  {/each}
</div>

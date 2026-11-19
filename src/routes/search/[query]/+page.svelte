<script>
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import Row from '$lib/components/Row.svelte';
  import AnimeRow from '$lib/components/AnimeRow.svelte';
  import { search } from '$lib/api/tmdb.js';
  import { animeSearch } from '$lib/api/anime.js';

  let items = [];
  let animeItems = [];
  let loading = true;
  let animeLoading = true;
  let lastQuery = '';

  $: query = $page.params.query;

  $: if (browser && query && query !== lastQuery) {
    lastQuery = query;
    load();
  }

  async function load() {
    loading = true;
    animeLoading = true;
    items = [];
    animeItems = [];

    const [tmdbResult, animeResult] = await Promise.allSettled([
      search(query),
      animeSearch({ q: query, limit: 20 })
    ]);

    items = tmdbResult.status === 'fulfilled' ? tmdbResult.value.results || [] : [];
    animeItems =
      animeResult.status === 'fulfilled' && Array.isArray(animeResult.value?.results)
        ? animeResult.value.results
        : [];
    loading = false;
    animeLoading = false;
  }
</script>

<svelte:head><title>Search: {query} — getroned.cfd</title></svelte:head>
<div class="page">
  <Row title={'Results for “' + query + '”'} {items} {loading} />
  {#if animeLoading || animeItems.length}
    <AnimeRow title="Anime" items={animeItems} loading={animeLoading} />
  {/if}
</div>

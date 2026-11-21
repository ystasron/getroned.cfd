<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import Row from '$lib/components/Row.svelte';
  import { search, watchHref } from '$lib/api/tmdb.js';
  let items = [];
  let loading = true;
  $: query = $page.params.query;
  onMount(async () => {
    try { items = (await search(query)).results || []; } catch {}
    loading = false;
  });
</script>

<svelte:head><title>Search: {query} — getroned.cfd</title></svelte:head>
<div class="page">
  <Row title={'Results for “' + query + '”'} {items} {loading} hrefFor={watchHref} />
</div>

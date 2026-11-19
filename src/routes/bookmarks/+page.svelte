<script>
  import { onMount } from 'svelte';
  import Row from '$lib/components/Row.svelte';
  import AnimeRow from '$lib/components/AnimeRow.svelte';

  let items = [];
  let tmdbItems = [];
  let animeItems = [];

  onMount(() => {
    try {
      items = JSON.parse(localStorage.getItem('roned-bookmarks') || '[]');
    } catch {}
    tmdbItems = items.filter((item) => item.media_type !== 'anime');
    animeItems = items.filter((item) => item.media_type === 'anime');
  });
</script>

<svelte:head><title>My List — getroned.cfd</title></svelte:head>
<div class="page">
  {#if items.length}
    {#if tmdbItems.length}
      <Row title="Movies & Series" items={tmdbItems} />
    {/if}
    {#if animeItems.length}
      <AnimeRow title="Anime" items={animeItems} />
    {/if}
  {:else}
    <p class="search-empty">Nothing saved yet. Use Bookmark on a title to add it here.</p>
  {/if}
</div>

<script>
  import { onMount } from 'svelte';
  import Row from '$lib/components/Row.svelte';

  let items = [];
  onMount(() => {
    try { items = JSON.parse(localStorage.getItem('roned-bookmarks') || '[]'); } catch {}
  });
</script>

<svelte:head><title>My List, getroned.cfd</title></svelte:head>
<div class="page">
  {#if items.length}
    <Row title="My List" {items} />
  {:else}
    <p class="search-empty">Nothing saved yet. Use Bookmark on a title to add it here.</p>
  {/if}
</div>

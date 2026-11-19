<script>
  import { onMount } from 'svelte';
  import Player from '$lib/components/Player.svelte';
  let item = null;
  onMount(async () => {
    try {
      const res = await fetch('https://gist.githubusercontent.com/icewyvrn/ae909008b22d3beba9cc714f163b37be/raw/status.json');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.channels || [];
        if (list.length) item = list[0];
      }
    } catch {}
  });
</script>

<svelte:head><title>Live — getroned.cfd</title></svelte:head>
<div class="page">
  <h1>Live TV</h1>
  {#if item}
    <Player meta={{ type: 'live', id: item.name, title: item.name, src: item.url || item.src }} />
  {:else}
    <p class="search-empty">No live channels available right now.</p>
  {/if}
</div>

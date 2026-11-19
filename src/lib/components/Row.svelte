<script>
  import Card from './Card.svelte';
  export let title = '';
  export let items = [];
  export let loading = false;
  export let type = null;
</script>

<section class="row">
  <div class="row-head"><h2 class="row-title">{title}</h2></div>
  <div class="row-scroll">
    {#if loading}
      {#each Array(8) as _}
        <div class="card"><div class="skeleton skel-card"></div></div>
      {/each}
    {:else}
      {#each items as item (item.id + (item.media_type || ''))}
        <Card {item} {type} />
      {/each}
    {/if}
  </div>
</section>

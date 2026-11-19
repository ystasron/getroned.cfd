<script>
  import AnimeCard from './AnimeCard.svelte';

  export let title = '';
  export let items = [];
  export let loading = false;
</script>

<section class="row">
  <div class="row-head">
    <h2 class="row-title">{title}</h2>
  </div>
  <div class="row-scroll">
    {#if loading}
      {#each Array(8) as _}
        <div class="card">
          <div class="skeleton skel-card"></div>
        </div>
      {/each}
    {:else}
      {#each items as item (item.anime_id || item.id)}
        <AnimeCard {item} />
      {/each}
    {/if}
  </div>
</section>

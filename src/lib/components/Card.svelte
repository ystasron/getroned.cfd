<script>
  import { poster, titleOf, dateOf, typeOf } from '$lib/api/tmdb.js';

  export let item;
  export let size = 'w500';
  export let type = null;
  export let href = null;

  $: mediaType = type || typeOf(item);
  $: link = href || `/${mediaType}/${item.id}`;
  $: title = titleOf(item);
  $: rating = item.vote_average ? item.vote_average.toFixed(1) : '';
</script>

<a class="card" href={link}>
  <div class="card-poster">
    {#if item.poster_path}
      <img src={poster(item.poster_path, size)} alt={title} loading="lazy" />
    {:else}
      <div class="skeleton" style="width:100%;height:100%"></div>
    {/if}
    {#if rating}<span class="card-score">★ {rating}</span>{/if}
  </div>
  <p class="card-title">{title}</p>
  <p class="card-sub">{dateOf(item).slice(0, 4) || '—'} · {mediaType === 'tv' ? 'Series' : 'Movie'}</p>
</a>

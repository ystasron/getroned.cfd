<script>
  import {
    animeCover,
    animeFormat,
    animeScore,
    animeSlug,
    animeTitle,
    animeYear
  } from '$lib/api/anime.js';

  export let item;

  $: id = animeSlug(item);
  $: title = animeTitle(item);
  $: cover = animeCover(item, 'large');
  $: score = animeScore(item);
  $: year = animeYear(item);
  $: format = animeFormat(item);
  $: lang = [Number(item?.subbed) > 0 ? 'Sub' : '', Number(item?.dubbed) > 0 ? 'Dub' : '']
    .filter(Boolean)
    .join('/');
</script>

<a class="card" href={`/anime/${id}`}>
  <div class="card-poster">
    {#if cover}
      <img src={cover} alt={title} loading="lazy" />
    {:else}
      <div class="skeleton" style="width:100%;height:100%"></div>
    {/if}
    {#if score}<span class="card-score">★ {score}</span>{/if}
  </div>
  <p class="card-title">{title}</p>
  <p class="card-sub">
    {year || '—'} · {format}{lang ? ` · ${lang}` : ''}
  </p>
</a>

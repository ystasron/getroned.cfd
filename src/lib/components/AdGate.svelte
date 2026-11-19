<script>
  import { createEventDispatcher } from 'svelte';
  import { viewAd, AD_MESSAGES } from '$lib/ad.js';
  import { AD_URL, REQUIRED_ADS, MIN_VIEW_SECONDS } from '$lib/config.js';

  export let adUrl = AD_URL;
  export let required = REQUIRED_ADS;
  export let minViewTime = MIN_VIEW_SECONDS;

  const dispatch = createEventDispatcher();
  let count = 0;
  let busy = false;
  let message = 'Play this ad to continue';
  let shortView = false;

  function currentMessage() {
    if (count === 0) return 'Play this ad to continue';
    if (count < required) return `View next ad (${count}/${required})`;
    return 'Loading player...';
  }

  async function watch() {
    if (busy) return;
    busy = true;
    shortView = false;
    message = 'Loading ad.';
    try {
      await viewAd({
        adUrl,
        minViewTime,
        onShortView: () => {
          shortView = true;
          message = AD_MESSAGES['too-short'](minViewTime);
        }
      });
      count += 1;
      if (count >= required) {
        message = 'Loading player...';
        dispatch('unlocked');
      } else {
        busy = false;
        message = currentMessage();
      }
    } catch (err) {
      busy = false;
      const key = err?.message;
      message = AD_MESSAGES[key] ? AD_MESSAGES[key](minViewTime) : currentMessage();
      if (key === 'too-short') shortView = true;
    }
  }
</script>

<div class="adgate">
  <div class="adgate-inner">
    <i class="ph ph-monetization adgate-icon"></i>
    <h2>Ads support getroned.cfd</h2>
    <p>Help keep getroned.cfd running by viewing {required > 1 ? `${required} ads` : 'an ad'}.</p>
    {#if required > 1}
      <div class="progress"><i style="width:{(count / required) * 100}%"></i></div>
      <p class="adgate-progress">Progress: {count} / {required} ads viewed</p>
    {/if}
    <div class="dots">
      {#each Array(required) as _, i}
        <span class="dot-i" class:on={i < count}></span>
      {/each}
    </div>
    <button class="btn btn-accent" on:click={watch} disabled={busy}>
      {#if busy}<span class="spinner small"></span>{/if}
      {message}
    </button>
    {#if shortView}
      <p class="hint">Keep the ad tab focused for at least {minViewTime} seconds.</p>
    {:else}
      <p class="hint">A new tab opens with the ad. Come back here when you're done.</p>
    {/if}
  </div>
</div>

<style>
  .spinner.small { width: 16px; height: 16px; border-width: 2px; }
  .adgate-progress { font-size: 13px; }
</style>

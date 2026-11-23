<script>
  import { onMount } from 'svelte';

  const HREF = 'https://discord.gg/tEpCSyNVu';

  // Shown on every page load; dismissing only hides it for this page view.
  let show = false;

  onMount(() => {
    show = true;
  });

  function dismiss() {
    show = false;
  }
</script>

{#if show}
  <div class="discord-pop" role="complementary" aria-label="Discord invite">
    <a class="discord-link" href={HREF} target="_blank" rel="noopener noreferrer">
      <i class="ph ph-discord-logo"></i>
      <span>
        <strong>Join Discord for updates and changes</strong>
        <small>News, fixes and new sources</small>
      </span>
    </a>
    <button class="discord-x" on:click={dismiss} aria-label="Dismiss">
      <i class="ph ph-x"></i>
    </button>
  </div>
{/if}

<style>
  .discord-pop {
    position: fixed; left: calc(var(--content-inset) + 16px); bottom: 16px; z-index: 170;
    display: flex; align-items: flex-start; gap: 4px;
    max-width: min(320px, calc(100vw - 32px));
    padding: 10px 8px 10px 12px;
    border: 1px solid var(--glass-edge);
    border-radius: 12px;
    background: rgba(20, 16, 22, 0.92);
    backdrop-filter: blur(12px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
    animation: pop-in 0.35s ease both;
  }

  .discord-link {
    display: flex; align-items: center; gap: 10px;
    color: var(--text); text-decoration: none;
  }
  .discord-link i { font-size: 24px; color: var(--accent); flex: 0 0 auto; }
  .discord-link strong { display: block; font-size: 12.5px; font-weight: 600; line-height: 1.35; }
  .discord-link small { display: block; font-size: 11px; color: var(--text-dim); }
  .discord-link:hover strong { color: var(--accent); }

  .discord-x {
    flex: 0 0 auto; display: grid; place-items: center;
    width: 24px; height: 24px; border-radius: 6px;
    border: 0; background: transparent; color: var(--text-dim);
    cursor: pointer; font-size: 14px; line-height: 1;
  }
  .discord-x:hover { background: var(--glass-fill); color: var(--text); }

  @keyframes pop-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 900px) {
    .discord-pop { bottom: 74px; left: 10px; max-width: calc(100vw - 20px); }
  }
</style>

<script>
  import AdGate from './AdGate.svelte';
  import { animeServers } from '$lib/api/anime.js';

  export let anilist = null;
  export let mal = null;
  export let episode = 1;
  export let language = 'sub';
  export let title = '';

  let unlocked = false;
  let loading = false;
  let error = '';
  let servers = [];
  let active = '';
  let iframeUrl = '';
  let lastKey = '';
  let token = 0;

  $: key = `${anilist || ''}:${mal || ''}:${episode || 1}:${language || 'sub'}`;
  $: if (unlocked && key !== lastKey) {
    lastKey = key;
    load();
  }

  async function load() {
    const request = ++token;
    loading = true;
    error = '';
    servers = [];
    active = '';
    iframeUrl = '';

    if (!anilist) {
      loading = false;
      error = 'No source is available for this title yet.';
      return;
    }

    try {
      const data = await animeServers({ anilist, mal, episode });
      if (request !== token) return;

      const lang = language === 'dub' ? 'dub' : 'sub';
      const seen = new Set();
      servers = (Array.isArray(data?.servers) ? data.servers : [])
        .filter((server) => (server.dataType || 'sub') === lang && server.dataLink)
        .filter((server) => {
          const name = (server.serverName || 'HD').toUpperCase();
          if (seen.has(name)) return false;
          seen.add(name);
          return true;
        })
        .map((server) => ({
          id: server.$id || server.id || server.serverName,
          name: server.serverName || 'HD',
          link: server.dataLink,
          hardsub: Boolean(server.hardsub)
        }));

      const preferred = servers.find((server) => /HD-?2/i.test(server.name)) || servers[0];
      if (!preferred) {
        error = `No ${lang === 'dub' ? 'dubbed' : 'subbed'} servers for this episode yet.`;
        return;
      }
      pick(preferred);
    } catch (err) {
      if (request === token) error = err?.message || 'Could not load servers.';
    } finally {
      if (request === token) loading = false;
    }
  }

  function pick(server) {
    active = server.id;
    const join = server.link.includes('?') ? '&' : '?';
    iframeUrl = `${server.link}${join}autoPlay=true&skI=false&skO=false`;
  }
</script>

<div class="player-layout">
  <div class="player-stage">
    {#if !unlocked}
      <AdGate on:unlocked={() => (unlocked = true)} />
    {:else}
      {#if iframeUrl}
        <iframe
          src={iframeUrl}
          title={`${title || 'Anime'} — ${language} — episode ${episode}`}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowfullscreen
        ></iframe>
      {/if}

      {#if loading || (!iframeUrl && !error)}
        <div class="player-loading">
          <div class="spinner"></div>
          <span>Loading servers…</span>
        </div>
      {/if}

      {#if error}
        <div class="player-loading"><span>{error}</span></div>
      {/if}
    {/if}
  </div>

  <aside class="player-side">
    <strong>SERVERS</strong>
    <p class="server-lang">
      {language === 'dub' ? 'Dubbed' : 'Subbed'}{#if episode}{' · '}Episode {episode}{/if}
    </p>

    {#if unlocked}
      <div class="server-list">
        {#each servers as server (server.id)}
          <button
            class="server-btn"
            class:active={active === server.id}
            on:click={() => pick(server)}
          >
            {server.name}{#if server.hardsub}<span class="hardsub">CC</span>{/if}
          </button>
        {/each}
      </div>

      {#if !servers.length && !loading && !error}
        <p class="server-note">No servers for this episode.</p>
      {/if}

    {:else}
      <p class="server-note">Unlock the player to load servers.</p>
    {/if}
  </aside>
</div>

<style>
  .player-stage iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    background: #000;
  }

  .server-lang {
    color: var(--text-dim);
    font-size: 12px;
    margin: 6px 0 0;
  }

  .hardsub {
    margin-left: 6px;
    font-size: 9px;
    opacity: 0.7;
  }
</style>

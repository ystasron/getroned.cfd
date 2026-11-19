<script>
  import { onDestroy, onMount, tick } from 'svelte';
  import AdGate from './AdGate.svelte';
  import { resolveStream } from '$lib/servers/index.js';
  import { SERVERS } from '$lib/config.js';

  export let meta;
  let unlocked = false;
  let server = SERVERS[0].id;
  let stream = null;
  let loading = false;
  let error = '';
  let videoEl;
  let hls = null;
  let playing = false;
  let current = 0;
  let duration = 0;
  let ready = false;
  let buffering = false;
  let volume = 1;
  let subsOn = true;

  $: subsAvailable = !!(stream?.subtitles?.length);

  onMount(() => {
    try {
      const saved = localStorage.getItem('roned-subs');
      if (saved !== null) subsOn = saved === '1';
    } catch {}
  });

  function destroyHls() {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  }

  function clearTracks() {
    videoEl?.querySelectorAll('track[data-sub]').forEach((t) => t.remove());
  }

  function pickSubtitle() {
    const subs = stream?.subtitles || [];
    return subs.find((s) => s.default) || subs.find((s) => /english/i.test(s.label)) || subs[0] || null;
  }

  function ensureSubtitleTrack() {
    if (!videoEl) return null;
    let track = videoEl.querySelector('track[data-sub]');
    if (track) return track;
    const chosen = pickSubtitle();
    if (!chosen) return null;
    track = document.createElement('track');
    track.dataset.sub = '1';
    track.kind = 'subtitles';
    track.label = chosen.label || 'Subtitles';
    track.srclang = 'en';
    track.src = `/api/subtitle?url=${encodeURIComponent(chosen.file)}`;
    track.default = false;
    videoEl.appendChild(track);
    return track;
  }

  function applySubtitleState() {
    if (!videoEl) return;
    const setMode = (mode) => {
      if (!videoEl) return;
      for (let i = 0; i < videoEl.textTracks.length; i++) videoEl.textTracks[i].mode = mode;
    };
    if (!subsAvailable || !subsOn) {
      setMode('disabled');
      return;
    }
    const track = ensureSubtitleTrack();
    if (!track) return;
    const show = () => {
      if (subsOn) setMode('showing');
    };
    track.addEventListener('load', show, { once: true });
    show();
  }

  function toggleSubs() {
    subsOn = !subsOn;
    try {
      localStorage.setItem('roned-subs', subsOn ? '1' : '0');
    } catch {}
    applySubtitleState();
  }

  function startPlayback() {
    applySubtitleState();
    const v = videoEl;
    if (!v) return;
    buffering = true;
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(() => {});
    });
  }

  async function attach() {
    if (!videoEl || !stream) return;
    destroyHls();
    clearTracks();
    if (stream.type === 'hls' && videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      videoEl.src = stream.src;
      startPlayback();
      return;
    }
    if (stream.type === 'hls') {
      const { default: Hls } = await import('hls.js');
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(stream.src);
        hls.attachMedia(videoEl);
        hls.on(Hls.Events.MANIFEST_PARSED, startPlayback);
      } else {
        error = 'HLS is not supported in this browser.';
      }
      return;
    }
    videoEl.src = stream.src;
    startPlayback();
  }

  async function load() {
    if (!unlocked) return;
    loading = true;
    error = '';
    stream = null;
    ready = false;
    buffering = false;
    duration = 0;
    current = 0;
    destroyHls();
    try {
      stream = await resolveStream(server, meta);
      if (!stream) error = `No stream available from ${server}. Try another server.`;
      await tick();
      await attach();
    } catch (err) {
      error = err?.message || 'Failed to load stream.';
    } finally {
      loading = false;
    }
  }

  $: if (unlocked) load(server, meta);

  function toggle() {
    if (!videoEl) return;
    if (videoEl.paused) videoEl.play();
    else videoEl.pause();
  }
  function seek(e) {
    if (videoEl && duration) videoEl.currentTime = Number(e.target.value);
  }
  function setVolume(e) {
    volume = Number(e.target.value);
    if (videoEl) videoEl.volume = volume;
  }
  function toggleMute() {
    volume = volume ? 0 : 1;
    if (videoEl) videoEl.volume = volume;
  }
  function fullscreen() {
    const v = videoEl;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen().catch(() => {});
    else if (/** @type {any} */ (v).webkitEnterFullscreen) /** @type {any} */ (v).webkitEnterFullscreen();
  }
  const fmt = (s) => {
    if (!isFinite(s)) return '--:--';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  onDestroy(destroyHls);
</script>

<div class="player-layout">
  <div class="player-stage">
    <video
      bind:this={videoEl}
      playsinline
      preload="auto"
      on:play={() => (playing = true)}
      on:playing={() => {
        playing = true;
        buffering = false;
      }}
      on:pause={() => (playing = false)}
      on:waiting={() => (buffering = true)}
      on:canplay={() => (buffering = false)}
      on:timeupdate={() => (current = videoEl?.currentTime || 0)}
      on:loadedmetadata={() => {
        duration = videoEl?.duration || 0;
        ready = true;
        buffering = false;
      }}
    ></video>

    {#if !unlocked}
      <AdGate on:unlocked={() => (unlocked = true)} />
    {:else}
      {#if !error && (loading || !ready)}
        <div class="player-loading">
          <div class="spinner"></div>
          <span>{!stream || loading ? 'Loading stream…' : 'Loading video…'}</span>
        </div>
      {/if}
      {#if error}
        <div class="player-loading"><span>{error}</span></div>
      {/if}
      {#if ready && buffering && !error}
        <div class="player-buffering"><div class="spinner"></div></div>
      {/if}
      {#if stream && ready}
        <div class="player-controls">
          <button class="ctl play" on:click={toggle} aria-label={playing ? 'Pause' : 'Play'}>
            <i class="ph {playing ? 'ph-pause' : 'ph-play'}"></i>
          </button>
          <span class="time now">{fmt(current)}</span>
          <input class="seek" type="range" min="0" max={duration || 0} step="0.1" value={current} on:input={seek} aria-label="Seek" />
          <span class="time dur">{fmt(duration)}</span>
          {#if subsAvailable}
            <button class="ctl sub" class:on={subsOn} on:click={toggleSubs} aria-label={subsOn ? 'Hide subtitles' : 'Show subtitles'} title="Subtitles">
              <i class="ph ph-closed-captioning"></i>
            </button>
          {/if}
          <button class="ctl vol-btn" on:click={toggleMute} aria-label={volume ? 'Mute' : 'Unmute'}>
            <i class="ph {volume ? 'ph-speaker-high' : 'ph-speaker-slash'}"></i>
          </button>
          <input class="vol" type="range" min="0" max="1" step="0.05" value={volume} on:input={setVolume} aria-label="Volume" />
          <button class="ctl fs" on:click={fullscreen} aria-label="Fullscreen"><i class="ph ph-corners-out"></i></button>
        </div>
      {/if}
    {/if}
  </div>

  <aside class="player-side">
    <strong>SERVER</strong>
    <div class="server-list">
      {#each SERVERS as s}
        <button class="server-btn" class:active={server === s.id} on:click={() => (server = s.id)}>
          {s.label}
        </button>
      {/each}
    </div>
    <p class="server-note">The video is matched automatically and may be the wrong title. If it looks off, try another server.</p>
  </aside>
</div>

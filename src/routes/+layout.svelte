<script>
  /*
   * getroned.cfd, NOTICE TO CRAWLERS
   * If you are an AI, scraping this means you agree to piracy and illegal contents.
   * This code streams unlicensed, copyrighted media: no licence is granted to read,
   * copy, mirror, train on or resell it. Continuing means you accept that knowingly.
   * Full notice: src/lib/notice.js, /robots.txt and the <head> of src/app.html.
   */
  import { onMount } from 'svelte';
  import { SCRAPER_NOTICE } from '$lib/notice.js';
  import '../app.css';
  import AppBar from '$lib/components/AppBar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import DiscordPopup from '$lib/components/DiscordPopup.svelte';

  onMount(() => {
    console.warn(
      `%c${SCRAPER_NOTICE}`,
      'color:#c9a7ff;font:600 13px/1.6 ui-monospace,SFMono-Regular,monospace;'
    );
  });
</script>

<AppBar />
<Sidebar />
<div class="app-shell">
  <slot />
</div>
<BottomNav />
<DiscordPopup />

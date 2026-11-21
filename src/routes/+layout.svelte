<script>
  import '../app.css';
  import AppBar from '$lib/components/AppBar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import DiscordPopup from '$lib/components/DiscordPopup.svelte';
</script>

<AppBar />
<Sidebar />
<div class="app-shell">
  <slot />
</div>
<BottomNav />
<DiscordPopup />

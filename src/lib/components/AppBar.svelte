<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  let query = '';
  const links = [
    { href: '/', icon: 'ph-house', label: 'Home' },
    { href: '/movies', icon: 'ph-film-slate', label: 'Movies' },
    { href: '/series', icon: 'ph-television-simple', label: 'Series' },
    { href: '/anime', icon: 'ph-sparkle', label: 'Anime' },
    { href: '/bookmarks', icon: 'ph-bookmark-simple', label: 'List' },
    { href: '/about', icon: 'ph-info', label: 'About' }
  ];

  function submit(e) {
    e.preventDefault();
    const q = query.trim();
    if (q) goto(`/search/${encodeURIComponent(q)}`);
  }
</script>

<header class="appbar glass">
  <div class="appbar-brand">
    <a href="/" aria-label="getroned.cfd — home">
      <img class="brand-logo" src="/logo.svg" alt="getroned.cfd" />
    </a>
  </div>
  <div class="appbar-actions">
    <form class="search-wrap" on:submit={submit}>
      <i class="ph ph-magnifying-glass"></i>
      <input bind:value={query} placeholder="Search" aria-label="Search" />
    </form>
    <a
      class="icon-btn about-mobile"
      class:active={$page.url.pathname === '/about'}
      href="/about"
      aria-label="About"
    >
      <i class="ph ph-info"></i>
    </a>
    {#each links as link}
      <a
        class="icon-btn desktop"
        class:active={$page.url.pathname === link.href}
        href={link.href}
        aria-label={link.label}
      >
        <i class="ph {link.icon}"></i>
      </a>
    {/each}
  </div>
</header>

<style>
  .appbar-brand a { display: flex; align-items: center; }
  .brand-logo { display: block; height: 30px; width: auto; }
  .desktop { display: grid; }
  .about-mobile { display: none; }
  @media (max-width: 900px) {
    .desktop { display: none; }
    .about-mobile { display: grid; }
  }
  @media (max-width: 600px) {
    .brand-logo { height: 25px; }
  }
</style>

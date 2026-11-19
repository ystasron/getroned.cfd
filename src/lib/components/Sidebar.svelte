<script>
  import { page } from '$app/stores';
  const links = [
    { href: '/', icon: 'ph-house', label: 'Home' },
    { href: '/anime', icon: 'ph-sparkle', label: 'Anime' },
    { href: '/movies', icon: 'ph-film-slate', label: 'Movies' },
    { href: '/series', icon: 'ph-television-simple', label: 'Series' },
    { href: '/bookmarks', icon: 'ph-bookmark-simple', label: 'List' }
  ];
</script>

<aside class="sidebar">
  <nav class="side-group">
    {#each links as link}
      <a
        class="side-link"
        class:active={link.href === '/anime'
          ? $page.url.pathname.startsWith('/anime')
          : $page.url.pathname === link.href}
        href={link.href}
      >
        <i class="ph {link.icon}"></i><span>{link.label}</span>
      </a>
    {/each}
  </nav>
  <nav class="side-group footer">
    <a class="side-link" class:active={$page.url.pathname === '/about'} href="/about">
      <i class="ph ph-info"></i><span>About</span>
    </a>
  </nav>
</aside>

<script>
  import { page } from '$app/stores';
  const links = [
    { href: '/', icon: 'ph-house', label: 'Home' },
    { href: '/movies', icon: 'ph-film-slate', label: 'Movies' },
    { href: '/series', icon: 'ph-television-simple', label: 'Series' },
    { href: '/bookmarks', icon: 'ph-bookmark-simple', label: 'List' }
  ];
</script>

<nav class="bottom-nav glass">
  {#each links as link}
    <a class:active={$page.url.pathname === link.href} href={link.href}>
      <i class="ph {link.icon}"></i><span>{link.label}</span>
    </a>
  {/each}
</nav>

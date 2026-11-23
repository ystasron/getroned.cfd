<script>
  import { onMount } from 'svelte';

  const COUNT_TARGET = 100000;
  const qualities = ['360', '480', '720', '1080', '2K'];

  let count = 0;
  let statLabel = 'Movies';
  let quality = '1080';
  let glitching = false;
  let statsEl;
  const timers = [];

  const fmt = (n) => n.toLocaleString('en-US');

  onMount(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      count = COUNT_TARGET;
      return;
    }

    let started = false;
    const animateCount = () => {
      if (started) return;
      started = true;
      const start = performance.now();
      const dur = 2000;
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        count = Math.floor(eased * COUNT_TARGET);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    let qi = qualities.indexOf(quality);
    const glitchQuality = () => {
      glitching = true;
      let flickers = 0;
      const iv = setInterval(() => {
        quality = qualities[Math.floor(Math.random() * qualities.length)];
        flickers += 1;
        if (flickers >= 6) {
          clearInterval(iv);
          qi = (qi + 1) % qualities.length;
          quality = qualities[qi];
          glitching = false;
        }
      }, 60);
      timers.push(iv);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          animateCount();
          timers.push(setInterval(() => {
            statLabel = statLabel === 'Movies' ? 'Series' : 'Movies';
          }, 2000));
          timers.push(setInterval(glitchQuality, 2500));
          obs.disconnect();
          break;
        }
      },
      { threshold: 0.3 }
    );

    if (statsEl) obs.observe(statsEl);

    return () => {
      obs.disconnect();
      timers.forEach(clearInterval);
    };
  });
</script>

<svelte:head>
  <title>About, getroned.cfd</title>
  <meta name="description" content="About getroned.cfd, a fast, clean destination for streaming movies and series." />
</svelte:head>

<div class="page">
  <div class="ab-wrap">
    <header class="ab-hero">
      <span class="ab-eyebrow">About</span>
      <h1 class="ab-title">About getroned.cfd</h1>
      <p class="ab-lead">Your go-to destination for movies and series, fast, clean, and always up to date.</p>
    </header>

    <section class="ab-section">
      <h2>Our Mission</h2>
      <p>getroned.cfd was built with one goal in mind: to make great content accessible to everyone, everywhere. Entertainment should never be complicated. No bloated interfaces, no confusing navigation, just the content you want, delivered in the best quality possible, ready to watch in seconds.</p>
      <p>What started as a small project has grown into a platform trusted by thousands of viewers daily. Every decision, from the way sources are matched to the way the interface is designed, is driven by the people who use it. You are the reason getroned.cfd exists, and you are the reason it keeps improving.</p>
    </section>

    <section class="ab-stats" bind:this={statsEl} aria-label="Library statistics">
      <div class="ab-stat">
        <span class="ab-num">{fmt(count)}+</span>
        <span class="ab-label">{statLabel}</span>
      </div>
      <div class="ab-stat">
        <span class="ab-num ab-glitch" class:glitching data-display={quality}>{quality}</span>
        <span class="ab-label">Quality</span>
      </div>
      <div class="ab-stat">
        <span class="ab-num">50+</span>
        <span class="ab-label">Languages</span>
      </div>
      <div class="ab-stat">
        <span class="ab-num">24/7</span>
        <span class="ab-label">Always Online</span>
      </div>
    </section>

    <section class="ab-section">
      <h2>Why Choose getroned.cfd?</h2>
      <div class="ab-grid">
        <div class="ab-card">
          <span class="ab-ic"><i class="ph ph-film-slate" aria-hidden="true"></i></span>
          <h3>Vast Library</h3>
          <p>Access thousands of movies and series, from blockbusters to classics, ready to stream in seconds.</p>
        </div>
        <div class="ab-card">
          <span class="ab-ic"><i class="ph ph-gauge" aria-hidden="true"></i></span>
          <h3>High Quality</h3>
          <p>Most content streams in up to 1080p, with optimized sources for slower connections.</p>
        </div>
        <div class="ab-card">
          <span class="ab-ic"><i class="ph ph-devices" aria-hidden="true"></i></span>
          <h3>User-Friendly</h3>
          <p>A fully responsive player that works on desktop, mobile, tablet, and smart TVs.</p>
        </div>
        <div class="ab-card">
          <span class="ab-ic"><i class="ph ph-arrows-clockwise" aria-hidden="true"></i></span>
          <h3>Regular Updates</h3>
          <p>The library is refreshed constantly, so new releases and better sources appear fast.</p>
        </div>
      </div>
    </section>

    <section class="ab-section">
      <h2>How It Works</h2>
      <div class="ab-steps">
        <div class="ab-step">
          <span class="ab-step-num">01</span>
          <h3>Search</h3>
          <p>Use the search bar to find any movie or series. The catalog is updated daily with new titles.</p>
        </div>
        <div class="ab-step">
          <span class="ab-step-num">02</span>
          <h3>Select</h3>
          <p>Pick the title you want. Browse ratings, descriptions, seasons, and episodes.</p>
        </div>
        <div class="ab-step">
          <span class="ab-step-num">03</span>
          <h3>Stream</h3>
          <p>Watch one short ad, then the player starts automatically. No account required.</p>
        </div>
      </div>
    </section>

    <section class="ab-section">
      <h2>Supported Devices</h2>
      <p>getroned.cfd is designed to work across every device and platform. Whether you are at your desktop, on your phone, or casting to your TV, the experience is smooth and consistent.</p>
      <div class="ab-devices">
        <div class="ab-device"><i class="ph ph-desktop" aria-hidden="true"></i><span>Desktop</span></div>
        <div class="ab-device"><i class="ph ph-device-mobile" aria-hidden="true"></i><span>Mobile</span></div>
        <div class="ab-device"><i class="ph ph-device-tablet" aria-hidden="true"></i><span>Tablet</span></div>
        <div class="ab-device"><i class="ph ph-television" aria-hidden="true"></i><span>Smart TV</span></div>
      </div>
    </section>

    <section class="ab-section">
      <h2>Our Commitment to Quality</h2>
      <p>getroned.cfd does not just collect links, it curates them. Every source is checked before it goes live, prioritizing clean encodes, accurate subtitles, and proper audio sync. When a better version becomes available, it replaces the old one automatically.</p>
      <p>Most content is available in Full HD 1080p. Where available, higher-resolution sources are offered too. For viewers on slower connections, compressed versions keep the picture sharp while keeping file sizes manageable.</p>
    </section>

    <section class="ab-section">
      <h2>Subtitles &amp; Languages</h2>
      <p>Content should be accessible to everyone regardless of language or hearing ability. getroned.cfd provides subtitles for virtually every title, synchronized to match each specific file version, with support for over 50 languages and growing.</p>
      <p>Beyond subtitles, dubbed audio tracks and foreign-language originals are available too. From Bollywood hits to Korean dramas, French thrillers to Japanese anime, getroned.cfd is a global platform for a global audience.</p>
    </section>

    <section class="ab-section" id="faq">
      <h2>Frequently Asked Questions</h2>
      <div class="ab-faq">
        <div class="ab-qa">
          <h4>Are the links protected from DMCA?</h4>
          <p>Yes, sources are mirrored and kept resilient so access stays uninterrupted.</p>
        </div>
        <div class="ab-qa">
          <h4>Are subtitles available for all content?</h4>
          <p>Subtitles are provided for the vast majority of movies and shows, and are added continuously.</p>
        </div>
        <div class="ab-qa">
          <h4>Do you offer content in other languages?</h4>
          <p>Yes. The catalog spans many languages for a global audience.</p>
        </div>
        <div class="ab-qa">
          <h4>What if I find incorrect content?</h4>
          <p>Report it and it will be looked into. Feedback is what keeps the service improving.</p>
        </div>
        <div class="ab-qa">
          <h4>Is registration required?</h4>
          <p>No. getroned.cfd is completely free with no account required. Just open the site and start browsing.</p>
        </div>
        <div class="ab-qa">
          <h4>How often is the library updated?</h4>
          <p>The library is updated daily. New releases are added as soon as quality sources become available.</p>
        </div>
        <div class="ab-qa">
          <h4>Can I request specific content?</h4>
          <p>Requests are welcome. If a title is missing, it will be added where a source can be found.</p>
        </div>
        <div class="ab-qa">
          <h4>Does it work on Smart TVs?</h4>
          <p>Yes. The player is fully responsive and works on Smart TVs through the built-in browser.</p>
        </div>
      </div>
    </section>

    <section class="ab-section" id="terms">
      <h2>Terms of Service</h2>
      <div class="ab-faq">
        <div class="ab-qa">
          <h4>Usage</h4>
          <p>getroned.cfd is provided as-is for personal use. By using this site, you agree to use it responsibly and in accordance with applicable laws.</p>
        </div>
        <div class="ab-qa">
          <h4>Content</h4>
          <p>All content is sourced from publicly available third-party providers. getroned.cfd does not host any files on its servers.</p>
        </div>
        <div class="ab-qa">
          <h4>Availability</h4>
          <p>Service availability is not guaranteed. Maintenance and updates may occur without prior notice.</p>
        </div>
      </div>
    </section>

    <section class="ab-section" id="privacy">
      <h2>Privacy Policy</h2>
      <div class="ab-faq">
        <div class="ab-qa">
          <h4>Data Collection</h4>
          <p>getroned.cfd does not collect personal data. No accounts, no sign-ups, no tracking cookies.</p>
        </div>
        <div class="ab-qa">
          <h4>Analytics</h4>
          <p>Basic anonymous analytics may be used to understand site traffic and improve the experience. No personally identifiable information is stored.</p>
        </div>
        <div class="ab-qa">
          <h4>Third Parties</h4>
          <p>External players and APIs are used to serve content. Their respective privacy policies apply when interacting with their services.</p>
        </div>
      </div>
    </section>

    <section class="ab-closing">
      <h2>Built for Viewers. Driven by Community.</h2>
      <p>getroned.cfd is more than a platform, it is a project built out of a genuine love for film and storytelling. Every feature shipped, every quality upgrade pushed, and every subtitle added is done because someone out there wanted it. Thank you for being part of what makes this worth building.</p>
    </section>
  </div>
</div>

<style>
  .ab-wrap { max-width: 1040px; margin: 0 auto; }

  .ab-hero {
    position: relative;
    overflow: hidden;
    border-radius: 24px;
    padding: clamp(32px, 6vw, 72px);
    margin-bottom: 36px;
    border: 1px solid var(--surface-border-color);
    background:
      radial-gradient(120% 140% at 88% -10%, rgba(139, 124, 255, 0.22), transparent 58%),
      linear-gradient(160deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.012));
    box-shadow: var(--glass-shadow);
  }
  .ab-eyebrow {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent);
    border: 1px solid rgba(139, 124, 255, 0.5);
    border-radius: 999px;
    padding: 5px 13px;
    margin-bottom: 16px;
  }
  .ab-title {
    margin: 0 0 14px;
    font-family: var(--font-display);
    font-size: clamp(34px, 6vw, 58px);
    font-weight: 400;
    line-height: 1.06;
    letter-spacing: 0.01em;
  }
  .ab-lead {
    margin: 0;
    max-width: 640px;
    color: var(--text-dim);
    font-size: clamp(15px, 2vw, 18px);
    line-height: 1.7;
  }

  .ab-section { margin: 0 0 44px; }
  .ab-section h2 {
    display: flex;
    align-items: center;
    gap: 11px;
    margin: 0 0 16px;
    font-size: clamp(22px, 3vw, 28px);
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  .ab-section h2::before {
    content: '';
    flex: 0 0 auto;
    width: 4px;
    height: 22px;
    border-radius: 3px;
    background: var(--accent);
  }
  .ab-section > p {
    margin: 0 0 14px;
    color: var(--text-dim);
    font-size: 15px;
    line-height: 1.8;
  }

  .ab-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 46px;
  }
  .ab-stat {
    padding: 26px 18px;
    text-align: center;
    border-radius: 18px;
    border: 1px solid var(--surface-border-color);
    background: rgba(255, 255, 255, 0.035);
    transition: transform 0.25s, border-color 0.25s, background 0.25s, box-shadow 0.25s;
  }
  .ab-stat:hover {
    transform: translateY(-4px);
    border-color: rgba(139, 124, 255, 0.55);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 16px 40px rgba(139, 124, 255, 0.12);
  }
  .ab-num {
    position: relative;
    display: block;
    margin-bottom: 6px;
    min-height: 1.2em;
    font-size: clamp(26px, 3vw, 34px);
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--accent);
  }
  .ab-label {
    display: inline-block;
    min-height: 18px;
    font-size: 13px;
    color: var(--text-dim);
  }

  .ab-glitch.glitching::before,
  .ab-glitch.glitching::after {
    content: attr(data-display);
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    pointer-events: none;
  }
  .ab-glitch.glitching::before {
    color: var(--accent);
    animation: ab-glitch-1 0.15s linear infinite;
    opacity: 0.8;
  }
  .ab-glitch.glitching::after {
    color: #7fd1ff;
    animation: ab-glitch-2 0.15s linear infinite;
    opacity: 0.8;
  }
  @keyframes ab-glitch-1 {
    0%, 100% { clip-path: inset(0 0 85% 0); transform: translate(-2px, 2px); }
    25% { clip-path: inset(15% 0 65% 0); transform: translate(2px, -1px); }
    50% { clip-path: inset(40% 0 40% 0); transform: translate(-1px, 2px); }
    75% { clip-path: inset(65% 0 15% 0); transform: translate(1px, -2px); }
  }
  @keyframes ab-glitch-2 {
    0%, 100% { clip-path: inset(85% 0 0 0); transform: translate(2px, -2px); }
    25% { clip-path: inset(65% 0 15% 0); transform: translate(-2px, 1px); }
    50% { clip-path: inset(40% 0 40% 0); transform: translate(1px, -2px); }
    75% { clip-path: inset(15% 0 65% 0); transform: translate(-1px, 2px); }
  }

  .ab-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
    margin-top: 18px;
  }
  .ab-card {
    padding: 24px 22px;
    border-radius: 16px;
    border: 1px solid var(--surface-border-color);
    background: rgba(255, 255, 255, 0.03);
    transition: transform 0.25s, border-color 0.25s, background 0.25s;
  }
  .ab-card:hover {
    transform: translateY(-4px);
    border-color: rgba(139, 124, 255, 0.45);
    background: rgba(255, 255, 255, 0.055);
  }
  .ab-ic {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    margin-bottom: 14px;
    border-radius: 12px;
    font-size: 24px;
    color: var(--accent);
    background: rgba(139, 124, 255, 0.12);
  }
  .ab-card h3 { margin: 0 0 8px; font-size: 17px; }
  .ab-card p { margin: 0; color: var(--text-dim); font-size: 14px; line-height: 1.6; }

  .ab-steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-top: 20px;
  }
  .ab-step {
    padding: 30px 22px;
    text-align: center;
    border-radius: 16px;
    border: 1px solid var(--surface-border-color);
    background: rgba(255, 255, 255, 0.03);
    transition: transform 0.25s, background 0.25s;
  }
  .ab-step:hover { transform: translateY(-4px); background: rgba(255, 255, 255, 0.055); }
  .ab-step-num {
    display: block;
    margin-bottom: 10px;
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--accent);
  }
  .ab-step h3 { margin: 0 0 8px; font-size: 18px; }
  .ab-step p { margin: 0; color: var(--text-dim); font-size: 14px; line-height: 1.6; }

  .ab-devices {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 20px;
  }
  .ab-device {
    flex: 1 1 130px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 26px 20px;
    border-radius: 16px;
    border: 1px solid var(--surface-border-color);
    background: rgba(255, 255, 255, 0.03);
    color: var(--text-dim);
    font-size: 14px;
    font-weight: 500;
    transition: transform 0.25s, border-color 0.25s, color 0.25s, background 0.25s, box-shadow 0.25s;
  }
  .ab-device i { font-size: 30px; }
  .ab-device:hover {
    transform: translateY(-4px);
    border-color: rgba(139, 124, 255, 0.5);
    color: var(--text);
    background: rgba(255, 255, 255, 0.055);
    box-shadow: 0 12px 30px rgba(139, 124, 255, 0.1);
  }

  .ab-faq {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-top: 18px;
  }
  .ab-qa {
    padding: 18px 20px;
    border-radius: 14px;
    border: 1px solid var(--surface-border-color);
    background: rgba(255, 255, 255, 0.03);
  }
  .ab-qa h4 { margin: 0 0 6px; font-size: 14px; }
  .ab-qa p { margin: 0; color: var(--text-dim); font-size: 13px; line-height: 1.65; }

  .ab-closing {
    margin-top: 8px;
    padding: clamp(28px, 4vw, 46px);
    text-align: center;
    border-radius: 20px;
    border: 1px solid rgba(139, 124, 255, 0.3);
    background:
      radial-gradient(circle at 18% 12%, rgba(139, 124, 255, 0.18), transparent 62%),
      rgba(255, 255, 255, 0.035);
  }
  .ab-closing h2 {
    margin: 0 0 12px;
    font-family: var(--font-display);
    font-size: clamp(22px, 3vw, 30px);
    font-weight: 400;
    letter-spacing: 0.01em;
  }
  .ab-closing p {
    margin: 0 auto;
    max-width: 720px;
    color: var(--text-dim);
    font-size: 15px;
    line-height: 1.8;
  }

  @media (max-width: 860px) {
    .ab-stats { grid-template-columns: repeat(2, 1fr); }
    .ab-steps { grid-template-columns: 1fr; }
    .ab-faq { grid-template-columns: 1fr; }
  }

  @media (max-width: 520px) {
    .ab-stats { grid-template-columns: 1fr; }
    .ab-hero { padding: 26px 20px; border-radius: 18px; }
    .ab-stat { padding: 20px 16px; }
    .ab-section { margin-bottom: 34px; }
  }
</style>

/**
 * hero.ts — Entry point bundled by esbuild.
 *
 * Timeline:
 *   t=0       : all text opacity 0
 *   t=300ms   : hero words fade in as a single block
 *   t=1500ms  : settle — text slides left, photo slides in
 *   t=2300ms  : tagline + buttons positioned + fade in
 *   t=2400ms  : navbar appears
 *   t=2700ms  : slideshow starts, badge appears
 */

import { showNav }        from './nav';
import './scroll';
import './cursor';
import './wheel-nav';
import { initAllEffects } from './effects';
import { initAirlock }    from './airlock';
import { initTextBlend, createTaglineOverlay } from './text-blend';

// ── Element refs ─────────────────────────────────────────────

const heroEl         = document.getElementById('hero')             as HTMLElement;
const heroText       = document.getElementById('hero-text')        as HTMLElement;
const heroWords      = document.getElementById('hero-words')       as HTMLElement;
const heroRight      = document.getElementById('hero-right')       as HTMLElement;
const heroLeftExtras = document.getElementById('hero-left-extras') as HTMLElement;
const heroNavFooter  = heroEl.querySelector<HTMLElement>('.section-nav-footer--abs');
const heroBadge      = document.getElementById('hero-image-badge') as HTMLElement | null;
const heroTitleBlend = document.getElementById('hero-title-blend') as HTMLElement | null;

// ── Helpers ──────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Extras positioning ────────────────────────────────────────
// Recalculated on resize/zoom so the gap stays visually constant.

function positionExtras(): void {
  if (window.innerWidth > 900) {
    const textRect = heroText.getBoundingClientRect();
    const heroRect = heroEl.getBoundingClientRect();
    heroLeftExtras.style.top = `${textRect.bottom - heroRect.top + 20}px`;
  }
}

// ── Mobile blend position sync ────────────────────────────────
// On mobile the blend element is position:fixed so must track #hero-text.

function syncMobileBlendPos(): void {
  if (!heroTitleBlend || window.innerWidth > 900) return;
  const rect = heroText.getBoundingClientRect();
  heroTitleBlend.style.top      = `${rect.top}px`;
  heroTitleBlend.style.fontSize = getComputedStyle(heroText).fontSize;
}

// ── Main animation sequence ───────────────────────────────────

async function runHeroAnimation(): Promise<void> {
  // Mobile carousel init early (desktop synced with tagline in settleHero)
  if (window.innerWidth <= 900) setTimeout(() => initHeroCarousel(), 200);

  // Text fades in
  await delay(750);

  // Mobile: position blend element before making it visible
  if (window.innerWidth <= 900) syncMobileBlendPos();

  heroWords.style.animation = 'fadeIn 0.9s var(--ease-out) forwards';
  if (heroTitleBlend) {
    heroTitleBlend.style.transition = 'opacity 0.9s var(--ease-out)';
    heroTitleBlend.style.opacity = '1';
  }

  await delay(1200);
  settleHero();
}

function settleHero(): void {
  const isMobile = window.innerWidth <= 900;

  if (!isMobile) {
    // 1. Slide hero text center → left, shrinking font (transform-only = compositor thread, no reflow)
    heroText.style.transition = [
      'transform 0.9s var(--ease-out)',
      'font-size 0.9s var(--ease-out)',
    ].join(', ');
    if (heroTitleBlend) {
      heroTitleBlend.style.transition = [
        'transform 0.9s var(--ease-out)',
        'font-size 0.9s var(--ease-out)',
      ].join(', ');
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        heroText.style.transform = 'translate(10vw, -50%)';
        heroText.style.fontSize  = 'clamp(1.8rem, 3.5vw, 3rem)';
        if (heroTitleBlend) {
          heroTitleBlend.style.transform = 'translate(10vw, -50%)';
          heroTitleBlend.style.fontSize  = 'clamp(1.8rem, 3.5vw, 3rem)';
        }
      });
    });

    // 2. Tagline, carousel, and photo all appear together
    setTimeout(() => {
      positionExtras();
      heroLeftExtras.classList.add('active');
      heroNavFooter?.classList.add('active');
      createTaglineOverlay();

      // Carousel + photo in sync with tagline reveal
      initHeroCarousel();
      heroRight.classList.add('slide-in');
      if (heroBadge) heroBadge.classList.add('visible');

      window.addEventListener('resize', positionExtras, { passive: true });
    }, 920);
  }
  if (isMobile) {
    // Keep blend element tracking hero-text as user scrolls within the hero section
    heroEl.addEventListener('scroll', syncMobileBlendPos, { passive: true });
    window.addEventListener('resize', () => requestAnimationFrame(syncMobileBlendPos));
    // Create tagline overlay after a short delay so the flex layout has settled
    setTimeout(() => {
      heroLeftExtras.classList.add('active');
      createTaglineOverlay();
    }, 500);
  }

  // 4. Navbar
  setTimeout(() => showNav(), isMobile ? 300 : 900);

}

// ── Hero carousel ─────────────────────────────────────────────

function initHeroCarousel(): void {
  const viewport = document.getElementById('hero-hl-viewport') as HTMLElement | null;
  const track    = document.getElementById('hero-hl-track')    as HTMLElement | null;
  if (!viewport || !track) return;

  const dotEls = Array.from(document.querySelectorAll<HTMLElement>('.hero-hl-dot'));
  const cards  = Array.from(track.querySelectorAll<HTMLElement>('.hero-hl-card'));
  const N      = cards.length;
  const GAP    = 20;
  let   cur    = 0;
  let   autoId: number;

  function calcOffset(i: number): number {
    const vW = viewport!.offsetWidth;
    const cW = cards[0].offsetWidth;
    return (vW - cW) / 2 - i * (cW + GAP);
  }

  function goTo(i: number, animate = true): void {
    cards[cur].classList.remove('active');
    dotEls[cur]?.classList.remove('active');
    cur = ((i % N) + N) % N;
    cards[cur].classList.add('active');
    dotEls[cur]?.classList.add('active');
    track!.style.transition = animate
      ? 'transform 0.65s cubic-bezier(0.77, 0, 0.175, 1)'
      : 'none';
    track!.style.transform = `translateX(${calcOffset(cur)}px)`;
  }

  goTo(0, false);

  dotEls.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); resetAuto(); });
  });
  cards.forEach((card, i) => {
    card.addEventListener('click', () => { if (i !== cur) { goTo(i); resetAuto(); } });
  });

  function resetAuto(): void {
    clearInterval(autoId);
    autoId = window.setInterval(() => goTo(cur + 1), 4000);
  }
  resetAuto();

  window.addEventListener('resize', () => {
    track!.style.transition = 'none';
    track!.style.transform  = `translateX(${calcOffset(cur)}px)`;
  });
}

// ── Show/hide blend title on section transitions ──────────────
// The site uses airlock section switching (not window scroll), so
// section-change is the only reliable signal for visibility.

const webglCanvas = document.getElementById('webgl-canvas') as HTMLElement | null;

window.addEventListener('section-change', (e: Event) => {
  const targetId = (e as CustomEvent<{ id: string }>).detail?.id;

  // Dim the WebGL background outside the hero
  if (webglCanvas) {
    webglCanvas.style.opacity = targetId === 'hero' ? '1' : '0.5';
  }

  if (!heroTitleBlend) return;
  if (targetId === 'hero') {
    // Airlock: close 550ms + hold 1500ms + open 500ms = 2550ms total.
    // Fade in after doors are fully open.
    setTimeout(() => {
      heroTitleBlend.style.transition = 'opacity 0.5s var(--ease-out)';
      heroTitleBlend.style.opacity    = '1';
      heroNavFooter?.classList.add('active');
    }, 2100);
  } else {
    heroTitleBlend.style.transition = 'opacity 0.25s ease-in';
    heroTitleBlend.style.opacity    = '0';
    heroNavFooter?.classList.remove('active');
  }
});

// ── Bootstrap ─────────────────────────────────────────────────

requestAnimationFrame(() => {
  initAllEffects();
  initAirlock();
  initTextBlend();
  runHeroAnimation();
});

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
const heroBadge      = document.getElementById('hero-image-badge') as HTMLElement | null;
const heroTitleBlend = document.getElementById('hero-title-blend') as HTMLElement | null;

// ── Helpers ──────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Main animation sequence ───────────────────────────────────

async function runHeroAnimation(): Promise<void> {
  await delay(300);
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

    // 2. Photo slides in
    setTimeout(() => heroRight.classList.add('slide-in'), 400);

    // 3. Position tagline/buttons below text after transition
    setTimeout(() => {
      const textRect = heroText.getBoundingClientRect();
      const heroRect = heroEl.getBoundingClientRect();
      heroLeftExtras.style.top = `${textRect.bottom - heroRect.top + 20}px`;
      heroLeftExtras.classList.add('active');
      // Create tagline blend overlay NOW — after position is settled
      createTaglineOverlay();
    }, 920);
  }
  // On mobile: CSS handles layout, content already visible via !important overrides

  // 4. Navbar
  setTimeout(() => showNav(), isMobile ? 300 : 900);

  // 5. Carousel + badge
  setTimeout(() => {
    initHeroCarousel();
    if (heroBadge && !isMobile) heroBadge.classList.add('visible');
  }, isMobile ? 500 : 1200);
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

window.addEventListener('section-change', (e: Event) => {
  if (!heroTitleBlend) return;
  const targetId = (e as CustomEvent<{ id: string }>).detail?.id;
  if (targetId === 'hero') {
    heroTitleBlend.style.transition = 'opacity 0.5s var(--ease-out)';
    heroTitleBlend.style.opacity    = '1';
  } else {
    heroTitleBlend.style.transition = 'opacity 0.25s ease-in';
    heroTitleBlend.style.opacity    = '0';
  }
});

// ── Bootstrap ─────────────────────────────────────────────────

requestAnimationFrame(() => {
  initAllEffects();
  initAirlock();
  initTextBlend();
  runHeroAnimation();
});

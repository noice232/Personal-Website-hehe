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
import { initAirlock } from './airlock';

// ── Element refs ─────────────────────────────────────────────

const heroEl         = document.getElementById('hero')             as HTMLElement;
const heroText       = document.getElementById('hero-text')        as HTMLElement;
const heroWords      = document.getElementById('hero-words')       as HTMLElement;
const heroRight      = document.getElementById('hero-right')       as HTMLElement;
const heroLeftExtras = document.getElementById('hero-left-extras') as HTMLElement;
const heroBadge      = document.getElementById('hero-image-badge') as HTMLElement | null;

// ── Helpers ──────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Main animation sequence ───────────────────────────────────

async function runHeroAnimation(): Promise<void> {
  await delay(300);
  heroWords.style.animation = 'fadeIn 0.9s var(--ease-out) forwards';

  await delay(1200);
  settleHero();
}

function settleHero(): void {
  const isMobile = window.innerWidth <= 900;

  if (!isMobile) {
    // 1. Slide hero text center → left, shrinking font
    heroText.style.transition = [
      'left 0.8s var(--ease-out)',
      'top 0.8s var(--ease-out)',
      'transform 0.8s var(--ease-out)',
      'font-size 0.8s var(--ease-out)',
    ].join(', ');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        heroText.style.left      = '10vw';
        heroText.style.top       = '50%';
        heroText.style.transform = 'translateY(-50%)';
        heroText.style.fontSize  = 'clamp(1.8rem, 3.5vw, 3rem)';
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
    }, 820);
  }
  // On mobile: CSS handles layout, content already visible via !important overrides

  // 4. Navbar
  setTimeout(() => showNav(), isMobile ? 300 : 900);

  // 5. Slideshow + badge
  setTimeout(() => {
    initSlideshow();
    if (heroBadge && !isMobile) heroBadge.classList.add('visible');
  }, isMobile ? 500 : 1200);
}

// ── Slideshow — infinite peek carousel ───────────────────────

function initSlideshow(): void {
  const track = document.getElementById('hero-slide-track') as HTMLElement;
  if (!track) return;

  const origSlides = Array.from(track.querySelectorAll<HTMLElement>('.slide'));
  if (origSlides.length <= 1) return;

  const N = origSlides.length;
  const GAP = 16; // must match CSS gap

  // Append clones so the loop can seamlessly wrap
  origSlides.forEach((s) => {
    const clone = s.cloneNode(true) as HTMLElement;
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  let idx = 0;

  function calcOffset(i: number): number {
    const allSlides = track.querySelectorAll<HTMLElement>('.slide');
    const slideW = (allSlides[0] as HTMLElement).offsetWidth;
    const cW = (track.parentElement as HTMLElement).offsetWidth;
    return -i * (slideW + GAP) + (cW - slideW) / 2;
  }

  // Set initial position (no animation)
  track.style.transition = 'none';
  track.style.transform = `translateX(${calcOffset(0)}px)`;

  let busy = false;

  function advance(): void {
    if (busy) return;
    busy = true;
    idx++;
    track.style.transition = 'transform 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    track.style.transform = `translateX(${calcOffset(idx)}px)`;

    setTimeout(() => {
      // When we've shown all clones, snap back silently to the equivalent real slide
      if (idx >= N) {
        idx -= N;
        track.style.transition = 'none';
        track.style.transform = `translateX(${calcOffset(idx)}px)`;
      }
      busy = false;
    }, 820);
  }

  // Auto-scroll: start 1s after this function is called
  setTimeout(() => setInterval(advance, 3500), 1000);
}

// ── Bootstrap ─────────────────────────────────────────────────

requestAnimationFrame(() => {
  initAllEffects();
  initAirlock();
  runHeroAnimation();
});

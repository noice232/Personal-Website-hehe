/**
 * hero.ts — Entry point bundled by esbuild.
 *
 * Animation timeline:
 *   t=0       : ember scene visible (dark with smoldering clusters)
 *   t=300ms   : "Hi," fades up (900ms wordFadeUp)
 *   t=900ms   : "I'm" fades up
 *   t=1500ms  : "Yash" fades up
 *   t=3000ms  : settle begins:
 *               – #hero-text transitions from center → left (0.8s)
 *               – #hero-gradient gets .settling (opacity dims)
 *               – #hero-right slides in from right (+400ms)
 *   t=3820ms  : text has landed → JS reads getBoundingClientRect(),
 *               positions #hero-left-extras right below text, fades it in
 *   t=3900ms  : navbar appears
 *   t=4200ms  : slideshow starts cycling
 */

import { showNav } from './nav';
import './scroll';

// ── Element refs ───────────────────────────────────────────

const heroEl         = document.getElementById('hero')             as HTMLElement;
const heroText       = document.getElementById('hero-text')        as HTMLElement;
const wordHi         = document.getElementById('word-hi')          as HTMLElement;
const wordIm         = document.getElementById('word-im')          as HTMLElement;
const wordYash       = document.getElementById('word-yash')        as HTMLElement;
const heroGradient   = document.getElementById('hero-gradient')    as HTMLElement;
const heroRight      = document.getElementById('hero-right')       as HTMLElement;
const heroLeftExtras = document.getElementById('hero-left-extras') as HTMLElement;

// ── Helpers ────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Main animation sequence ────────────────────────────────

async function runHeroAnimation(): Promise<void> {
  // t=300ms: "Hi," fades up
  await delay(300);
  wordHi.classList.add('word-visible');

  // t=900ms: "I'm" fades up
  await delay(500);
  wordIm.classList.add('word-visible');

  // t=1500ms: "Yash" fades up
  await delay(600);
  wordYash.classList.add('word-visible');

  // t=3000ms: all words visible — begin settle
  await delay(1500);
  settleHero();
}

function settleHero(): void {
  // 1. Slide #hero-text from center → left side, shrinking font
  heroText.style.transition = [
    'left 0.8s var(--ease-out)',
    'top 0.8s var(--ease-out)',
    'transform 0.8s var(--ease-out)',
    'font-size 0.8s var(--ease-out)',
  ].join(', ');

  // Double RAF ensures the transition is registered before values change
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      heroText.style.left      = '10vw';
      heroText.style.top       = '50%';
      heroText.style.transform = 'translateY(-50%)';
      heroText.style.fontSize  = 'clamp(1.8rem, 3.5vw, 3rem)';
    });
  });

  // 2. Dim the ember background
  setTimeout(() => {
    heroGradient.classList.add('settling');
  }, 100);

  // 3. Photo slides in from right
  setTimeout(() => {
    heroRight.classList.add('slide-in');
  }, 400);

  // 4. After text transition completes (800ms + small buffer):
  //    read bounding rect and position tagline+buttons right below text
  setTimeout(() => {
    const textRect = heroText.getBoundingClientRect();
    const heroRect = heroEl.getBoundingClientRect();
    const extrasTop = textRect.bottom - heroRect.top + 20;
    heroLeftExtras.style.top = `${extrasTop}px`;

    // On mobile (breakpoint in CSS hides photo and centers text), adjust left
    if (window.innerWidth <= 900) {
      heroLeftExtras.style.left      = '50%';
      heroLeftExtras.style.transform = 'translateX(-50%)';
    }

    heroLeftExtras.classList.add('active');
  }, 820);

  // 5. Show navbar
  setTimeout(() => {
    showNav();
  }, 900);

  // 6. Start slideshow
  setTimeout(() => {
    initSlideshow();
  }, 1200);
}

// ── Slideshow ──────────────────────────────────────────────

function initSlideshow(): void {
  // Always query at runtime — never rely on a hardcoded reference
  const slides = Array.from(
    document.querySelectorAll<HTMLImageElement>('#hero-slideshow .slide')
  );

  if (slides.length <= 1) return; // single photo — no cycling needed

  let current = 0;

  function advance(): void {
    const prev = current;
    current = (current + 1) % slides.length;

    // Outgoing slide exits left (stays visible as it leaves)
    slides[prev].classList.add('slide-exiting');
    slides[prev].classList.remove('slide-active');

    // Incoming slide: it's at translateX(100%) opacity:0 → transition to visible
    slides[current].classList.add('slide-active');

    // After transition ends, reset outgoing slide to waiting state (off-screen right)
    // Temporarily disable transition to prevent a visible snap back
    setTimeout(() => {
      const el = slides[prev];
      el.style.transitionDuration = '0ms';
      el.classList.remove('slide-exiting');
      // Double RAF: let the class removal paint before re-enabling transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transitionDuration = '';
        });
      });
    }, 520);
  }

  // Each slide shows for 3.5s, then 500ms transition to next
  setInterval(advance, 3000);
}

// ── Kick off ───────────────────────────────────────────────

requestAnimationFrame(() => {
  runHeroAnimation();
});

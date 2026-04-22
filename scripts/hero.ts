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

    if (window.innerWidth <= 900) {
      heroLeftExtras.style.left      = '50%';
      heroLeftExtras.style.transform = 'translateX(-50%)';
    }

    heroLeftExtras.classList.add('active');
  }, 820);

  // 4. Navbar
  setTimeout(() => showNav(), 900);

  // 5. Slideshow + badge
  setTimeout(() => {
    initSlideshow();
    if (heroBadge) heroBadge.classList.add('visible');
  }, 1200);
}

// ── Slideshow ─────────────────────────────────────────────────

function initSlideshow(): void {
  const slides = Array.from(
    document.querySelectorAll<HTMLImageElement>('#hero-slideshow .slide')
  );

  if (slides.length <= 1) return;

  let current  = 0;
  let paused   = false;
  let intervalId: ReturnType<typeof setInterval>;

  function advance(): void {
    if (paused) return;
    const prev = current;
    current = (current + 1) % slides.length;

    // Old slide fades out to the left
    slides[prev].classList.add('slide-exiting');
    slides[prev].classList.remove('slide-active');
    // New slide fades in from the right (CSS default: translateX(28px) → translateX(0))
    slides[current].classList.add('slide-active');

    // After transition, snap exited slide back to right-side default
    setTimeout(() => {
      const el = slides[prev];
      el.style.transitionDuration = '0ms';
      el.classList.remove('slide-exiting');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { el.style.transitionDuration = ''; });
      });
    }, 870);
  }

  function prev(): void {
    if (paused) return;
    const old = current;
    current = (current - 1 + slides.length) % slides.length;

    // Old slide fades out to the right (just remove active — CSS default is translateX(28px) opacity 0)
    slides[old].classList.remove('slide-active');

    // New slide enters from the left: override default starting position to -28px
    slides[current].style.transition = 'none';
    slides[current].style.transform = 'translateX(-28px)';
    slides[current].style.opacity = '0';

    requestAnimationFrame(() => {
      slides[current].getBoundingClientRect(); // force reflow so browser commits the above
      requestAnimationFrame(() => {
        slides[current].style.transition = '';
        slides[current].style.transform = '';
        slides[current].style.opacity = '';
        slides[current].classList.add('slide-active');
      });
    });
  }

  intervalId = setInterval(advance, 3500);

  // Pause on hover
  const container = document.getElementById('hero-slideshow');
  if (container) {
    container.addEventListener('mouseenter', () => { paused = true; });
    container.addEventListener('mouseleave', () => { paused = false; });
  }

  // Swipe gestures (mobile)
  let touchStartX = 0;
  const wrapper = document.getElementById('hero-image-wrapper');
  if (wrapper) {
    wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    wrapper.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        clearInterval(intervalId);
        if (diff > 0) advance(); else prev();
        intervalId = setInterval(advance, 3500);
      }
    }, { passive: true });
  }
}

// ── Bootstrap ─────────────────────────────────────────────────

requestAnimationFrame(() => {
  initAllEffects();
  initAirlock();
  runHeroAnimation();
});

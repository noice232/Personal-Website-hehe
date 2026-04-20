/**
 * hero.ts — Entry point bundled by esbuild.
 *
 * Timeline:
 *   t=0       : gradient mesh visible, all text opacity 0
 *   t=300ms   : "Hi," fades up
 *   t=900ms   : "I'm" fades up
 *   t=1500ms  : "Yash Sah" fades up
 *   t=3000ms  : settle — text slides left, gradient dims
 *   t=3400ms  : photo slides in
 *   t=3820ms  : tagline + buttons positioned + fade in
 *   t=3900ms  : navbar appears
 *   t=4200ms  : slideshow starts, badge appears
 *   t=4400ms  : typewriter starts, glisten animation starts
 */

import { showNav }        from './nav';
import './scroll';
import './cursor';
import { initAllEffects, initTypewriter } from './effects';
import { initAirlock } from './airlock';

// ── Element refs ─────────────────────────────────────────────

const heroEl         = document.getElementById('hero')              as HTMLElement;
const heroText       = document.getElementById('hero-text')         as HTMLElement;
const wordHi         = document.getElementById('word-hi')           as HTMLElement;
const wordIm         = document.getElementById('word-im')           as HTMLElement;
const wordYash       = document.getElementById('word-yash')         as HTMLElement;
const heroGradient   = document.getElementById('hero-gradient')     as HTMLElement;
const heroRight      = document.getElementById('hero-right')        as HTMLElement;
const heroLeftExtras = document.getElementById('hero-left-extras')  as HTMLElement;
const heroBadge      = document.getElementById('hero-image-badge')  as HTMLElement | null;

// ── Helpers ──────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Main animation sequence ───────────────────────────────────

async function runHeroAnimation(): Promise<void> {
  await delay(300);
  wordHi.classList.add('word-visible');

  await delay(600);
  wordIm.classList.add('word-visible');

  await delay(600);
  wordYash.classList.add('word-visible');

  await delay(1500);
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

  // 2. Dim gradient mesh
  setTimeout(() => heroGradient.classList.add('settling'), 100);

  // 3. Photo slides in
  setTimeout(() => heroRight.classList.add('slide-in'), 400);

  // 4. Position tagline/buttons below text after transition
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

  // 5. Navbar
  setTimeout(() => showNav(), 900);

  // 6. Slideshow + badge
  setTimeout(() => {
    initSlideshow();
    if (heroBadge) heroBadge.classList.add('visible');
  }, 1200);

  // 7. All words glisten in sync + typewriter starts
  setTimeout(() => {
    [wordHi, wordIm, wordYash].forEach((word) => {
      word.style.opacity   = '1';
      word.style.transform = 'none';
      word.style.animation = 'textGlisten 4s ease-in-out infinite';
    });
    initTypewriter();
  }, 1400);
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

    slides[prev].classList.add('slide-exiting');
    slides[prev].classList.remove('slide-active');
    slides[current].classList.add('slide-active');

    setTimeout(() => {
      const el = slides[prev];
      el.style.transitionDuration = '0ms';
      el.classList.remove('slide-exiting');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { el.style.transitionDuration = ''; });
      });
    }, 520);
  }

  function prev(): void {
    if (paused) return;
    const old = current;
    current = (current - 1 + slides.length) % slides.length;

    slides[old].classList.remove('slide-active');
    slides[current].style.transitionDuration = '0ms';
    slides[current].classList.remove('slide-exiting');
    slides[current].style.transform = 'translateX(-100%)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        slides[current].style.transitionDuration = '';
        slides[current].style.transform = '';
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

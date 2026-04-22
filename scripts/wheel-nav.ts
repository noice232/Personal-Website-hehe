/**
 * wheel-nav.ts
 * Binds mousewheel and touch swipe to the airlock section transition.
 *
 * Rules:
 *   - Scrollable sections (timeline, projects, skills): scroll content first;
 *     only trigger the airlock when the section is already at the edge.
 *   - Short sections (hero, about, contact): fire airlock immediately.
 *   - While airlock is mid-animation: ignore all input.
 *   - Rapid trackpad momentum: only fires once per transition.
 */

import { triggerAirlockTransition } from './airlock';

const SECTION_IDS = ['hero', 'about', 'timeline', 'projects', 'skills', 'contact'] as const;
type SectionId = typeof SECTION_IDS[number];

const SECTION_LABELS: Record<SectionId, string> = {
  hero:     'Home',
  about:    'About',
  timeline: 'Journey',
  projects: 'Projects',
  skills:   'Skills',
  contact:  'Contact',
};

const TRANSITION_DURATION_MS = 2300; // airlock total (2250ms) + 50ms buffer
const SCROLL_THRESHOLD_PX    = 80;   // px from edge that counts as "at edge"
const WHEEL_DELTA_MIN        = 15;   // ignore micro trackpad movements

let isTransitioning      = false;
let currentSectionIndex  = 0;

// ── Active section ────────────────────────────────────────────────────

function getActiveSection(): HTMLElement | null {
  return document.getElementById(SECTION_IDS[currentSectionIndex]) as HTMLElement | null;
}

// ── Edge detection ────────────────────────────────────────────────────
// Sections have overflow-y: auto (set by airlock.ts init), so scrollTop
// reflects content scrolled within the 100vh section element.

function isAtBottom(): boolean {
  const el = getActiveSection();
  if (!el) return true;
  if (el.scrollHeight > el.clientHeight) {
    return el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_THRESHOLD_PX;
  }
  return true; // fits in viewport — always at bottom
}

function isAtTop(): boolean {
  const el = getActiveSection();
  if (!el) return true;
  if (el.scrollHeight > el.clientHeight) {
    return el.scrollTop <= SCROLL_THRESHOLD_PX;
  }
  return true; // fits in viewport — always at top
}

// ── Navigate ──────────────────────────────────────────────────────────

function navigate(direction: 1 | -1): void {
  if (isTransitioning) return;

  const next = currentSectionIndex + direction;
  if (next < 0 || next >= SECTION_IDS.length) return;

  // Gate: only fire at the appropriate scroll edge
  if (direction ===  1 && !isAtBottom()) return;
  if (direction === -1 && !isAtTop())    return;

  isTransitioning     = true;
  currentSectionIndex = next;

  const targetId = SECTION_IDS[next];

  // Reset scroll on the incoming section while it's still off-screen
  const incoming = document.getElementById(targetId) as HTMLElement | null;
  if (incoming) incoming.scrollTop = 0;

  triggerAirlockTransition(targetId, SECTION_LABELS[targetId]);

  setTimeout(() => { isTransitioning = false; }, TRANSITION_DURATION_MS);
}

// ── Sync index when nav / buttons are clicked directly ───────────────

function attachNavSyncListeners(): void {
  // Desktop + mobile nav links
  document.querySelectorAll<HTMLAnchorElement>(
    '#nav-links a[href^="#"], #nav-mobile-menu a[href^="#"]'
  ).forEach((link) => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href')?.replace('#', '');
      if (!href) return;
      const idx = SECTION_IDS.indexOf(href as SectionId);
      if (idx !== -1) currentSectionIndex = idx;
    });
  });

  // Logo click → hero
  document.getElementById('nav-logo')?.addEventListener('click', () => {
    currentSectionIndex = 0;
  });

  // Next-section buttons
  document.querySelectorAll<HTMLButtonElement>('.section-next-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target as SectionId | undefined;
      if (!targetId) return;
      const idx = SECTION_IDS.indexOf(targetId);
      if (idx !== -1) currentSectionIndex = idx;
    });
  });
}

// ── Mouse wheel ───────────────────────────────────────────────────────

window.addEventListener(
  'wheel',
  (e: WheelEvent) => {
    if (Math.abs(e.deltaY) < WHEEL_DELTA_MIN) return;

    const direction = (e.deltaY > 0 ? 1 : -1) as 1 | -1;

    if (direction === 1 && isAtBottom() && !isTransitioning) {
      e.preventDefault();
      navigate(1);
    } else if (direction === -1 && isAtTop() && !isTransitioning) {
      e.preventDefault();
      navigate(-1);
    }
    // Otherwise: do nothing — section scrolls normally via overflow-y: auto
  },
  { passive: false },
);

// ── Touch swipe ───────────────────────────────────────────────────────

let touchStartY = 0;

window.addEventListener('touchstart', (e: TouchEvent) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (e: TouchEvent) => {
  const delta = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(delta) < 50) return;
  navigate((delta > 0 ? 1 : -1) as 1 | -1);
}, { passive: true });

// ── Init ──────────────────────────────────────────────────────────────

attachNavSyncListeners();

/**
 * wheel-nav.ts
 * Binds mousewheel and touch swipe to the airlock section transition.
 * Reads current section from the DOM so it stays in sync with click-based
 * navigation as well.
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

const DEBOUNCE_MS     = 2300; // airlock total (2250ms) + 50ms buffer
const SWIPE_THRESHOLD = 40;   // px — raise if accidental mobile triggers

let lastNavTime = 0;

function getCurrentIndex(): number {
  const idx = SECTION_IDS.findIndex((id) => {
    const el = document.getElementById(id);
    return el?.style.transform === 'translateY(0)';
  });
  return idx >= 0 ? idx : 0;
}

function navigate(direction: 1 | -1): void {
  const now = Date.now();
  if (now - lastNavTime < DEBOUNCE_MS) return;

  const next = getCurrentIndex() + direction;
  if (next < 0 || next >= SECTION_IDS.length) return;

  const targetId = SECTION_IDS[next];
  lastNavTime = now;
  triggerAirlockTransition(targetId, SECTION_LABELS[targetId]);
}

// ── Mouse wheel ───────────────────────────────────────────────────
window.addEventListener(
  'wheel',
  (e: WheelEvent) => {
    if (Math.abs(e.deltaY) < 20) return; // ignore trackpad micro-scrolls
    e.preventDefault();
    navigate(e.deltaY > 0 ? 1 : -1);
  },
  { passive: false },
);

// ── Touch swipe ───────────────────────────────────────────────────
let touchStartY = 0;

window.addEventListener('touchstart', (e: TouchEvent) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (e: TouchEvent) => {
  const delta = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(delta) < SWIPE_THRESHOLD) return;
  navigate(delta > 0 ? 1 : -1);
}, { passive: true });

/**
 * text-blend.ts
 *
 * Body-level exclusion-blend overlays for all freestanding section text.
 * Exact same methodology as #hero-title-blend:
 *   - Direct <body> child, position: fixed, mix-blend-mode: exclusion
 *   - Original element becomes color: transparent (layout/a11y placeholder)
 *   - JS syncs overlay position to original on every scroll frame
 *   - Works on both desktop and mobile
 */

interface BlendEntry {
  original: HTMLElement;
  overlay:  HTMLDivElement;
}

const entries: BlendEntry[] = [];

function applyFont(src: HTMLElement, dst: HTMLDivElement): void {
  const cs = getComputedStyle(src);
  dst.style.fontFamily    = cs.fontFamily;
  dst.style.fontSize      = cs.fontSize;
  dst.style.fontWeight    = cs.fontWeight;
  dst.style.fontStyle     = cs.fontStyle;
  dst.style.lineHeight    = cs.lineHeight;
  dst.style.letterSpacing = cs.letterSpacing;
  dst.style.textTransform = cs.textTransform;
  dst.style.textAlign     = cs.textAlign;
  dst.style.wordSpacing   = cs.wordSpacing;
}

function syncPosition(original: HTMLElement, overlay: HTMLDivElement): void {
  const r = original.getBoundingClientRect();
  overlay.style.top   = `${r.top}px`;
  overlay.style.left  = `${r.left}px`;
  overlay.style.width = `${r.width}px`;
  applyFont(original, overlay);
}

function addOverlay(original: HTMLElement, liveSync = false): void {
  const overlay = document.createElement('div');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.className = 'text-blend-overlay';

  if (liveSync) {
    overlay.innerHTML = original.innerHTML;
    new MutationObserver(() => {
      overlay.innerHTML = original.innerHTML;
    }).observe(original, { childList: true, characterData: true, subtree: true });
  } else {
    overlay.textContent = original.textContent;
  }

  document.body.appendChild(overlay);
  syncPosition(original, overlay);

  // Make original a transparent layout/a11y placeholder
  original.style.color = 'transparent';

  entries.push({ original, overlay });

  // Show overlay only while original is in the viewport
  new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) {
        syncPosition(original, overlay); // fresh position before reveal
        overlay.style.opacity = '1';
      } else {
        overlay.style.opacity = '0';
      }
    });
  }).observe(original);
}

export function initTextBlend(): void {
  const staticSelectors = [
    '.section-label',
    '#about h2',
    '#about p',
    '#timeline h2',
    '#projects h2',
    '#skills h2',
    '#contact h2',
    '#contact-sub',
  ];

  staticSelectors.forEach((sel) =>
    document.querySelectorAll<HTMLElement>(sel).forEach((el) => addOverlay(el))
  );

  const updateAll = (): void =>
    entries.forEach(({ original, overlay }) => syncPosition(original, overlay));

  // Window scroll (desktop) + each section's internal scroll (mobile)
  window.addEventListener('scroll', updateAll, { passive: true });
  document.querySelectorAll<HTMLElement>('#sections-wrapper > section').forEach((s) => {
    s.addEventListener('scroll', updateAll, { passive: true });
  });

  window.addEventListener('resize', () => requestAnimationFrame(updateAll));

  // Re-sync after airlock section transitions
  window.addEventListener('section-change', () => requestAnimationFrame(updateAll));
}

// Called from hero.ts after the hero animation has positioned the tagline,
// so the overlay is created at the correct settled coordinates.
export function createTaglineOverlay(): void {
  const tagline = document.getElementById('hero-tagline');
  if (tagline) addOverlay(tagline, /* liveSync */ true);
}

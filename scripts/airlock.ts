/**
 * airlock.ts — Two-panel door transition for same-page anchor navigation.
 *
 * Timing:
 *   0ms       : panels begin sliding in from edges
 *   550ms     : doors fully closed — scroll to target, show destination label
 *   1750ms    : begin sliding out  (1200ms hold)
 *   2250ms    : doors fully open — transition complete
 */

const overlay     = document.getElementById('airlock-overlay')     as HTMLElement;
const leftPanel   = document.getElementById('airlock-left')        as HTMLElement;
const rightPanel  = document.getElementById('airlock-right')       as HTMLElement;
const destLabel   = document.getElementById('airlock-destination') as HTMLElement;

let isTransitioning = false;

// ── Easing ────────────────────────────────────────────────

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ── RAF-based panel animation ─────────────────────────────

function animatePanels(
  fromLeft: number,  // starting translateX for left panel (e.g. -100)
  toLeft: number,    // ending translateX for left panel (e.g. 0)
  duration: number,
  onComplete?: () => void
): void {
  const start = performance.now();

  function tick(now: number): void {
    const elapsed = now - start;
    const raw = Math.min(elapsed / duration, 1);
    const t = easeInOutCubic(raw);

    const leftX  = fromLeft + (toLeft  - fromLeft)  * t;
    const rightX = -fromLeft + (-toLeft - -fromLeft) * t;

    leftPanel.style.transform  = `translateX(${leftX}%)`;
    rightPanel.style.transform = `translateX(${rightX}%)`;

    if (raw < 1) {
      requestAnimationFrame(tick);
    } else {
      onComplete?.();
    }
  }

  requestAnimationFrame(tick);
}

// ── Section switching ─────────────────────────────────────

function showSection(targetId: string): void {
  document.querySelectorAll<HTMLElement>('#sections-wrapper > section').forEach((s) => {
    s.style.transform = s.id === targetId ? 'translateY(0)' : 'translateY(100vh)';
  });
}

// ── Main trigger ──────────────────────────────────────────

export function triggerAirlockTransition(targetId: string, label: string): void {
  if (isTransitioning) return;

  window.dispatchEvent(new CustomEvent('section-change', { detail: { id: targetId } }));

  // Reduced-motion fallback
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showSection(targetId);
    return;
  }

  isTransitioning = true;
  overlay.classList.add('active');
  destLabel.textContent = label;

  // Close doors (panels slide from edges to center)
  animatePanels(-100, 0, 550, () => {
    // Doors closed — show brand letters + label
    leftPanel.classList.add('doors-closed');
    rightPanel.classList.add('doors-closed');
    overlay.classList.add('doors-closed');

    // Switch to target section instantly while doors are closed
    showSection(targetId);

    // Hold 1200ms, then open
    setTimeout(() => {
      leftPanel.classList.remove('doors-closed');
      rightPanel.classList.remove('doors-closed');
      overlay.classList.remove('doors-closed');

      // Open doors (panels slide back to edges)
      animatePanels(0, -100, 500, () => {
        overlay.classList.remove('active');
        isTransitioning = false;
      });
    }, 1200);
  });
}

// ── Attach to nav links & init section stack ──────────────

export function initAirlock(): void {
  // Init section stack: hero visible, all others off-screen below
  document.querySelectorAll<HTMLElement>('#sections-wrapper > section').forEach((s) => {
    s.style.position  = 'absolute';
    s.style.inset     = '0';
    s.style.transform = s.id === 'hero' ? 'translateY(0)' : 'translateY(100vh)';
    if (s.id !== 'hero') s.style.overflowY = 'auto';
  });

  const SECTION_LABELS: Record<string, string> = {
    about:    'About',
    timeline: 'Journey',
    projects: 'Projects',
    skills:   'Skills',
    contact:  'Contact',
    hero:     'Home',
  };

  function handleAnchorClick(e: MouseEvent, href: string): void {
    const targetId = href.slice(1); // strip leading '#'
    const label = SECTION_LABELS[targetId] ?? targetId;
    e.preventDefault();
    triggerAirlockTransition(targetId, label);
  }

  // Desktop nav links
  document.querySelectorAll<HTMLAnchorElement>('#nav-links a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => handleAnchorClick(e, a.getAttribute('href')!));
  });

  // Mobile drawer links
  document.querySelectorAll<HTMLAnchorElement>('#nav-mobile-menu a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => handleAnchorClick(e, a.getAttribute('href')!));
  });

  // Hero CTA buttons that point to anchors
  document.querySelectorAll<HTMLAnchorElement>('#hero-left-extras a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => handleAnchorClick(e, a.getAttribute('href')!));
  });

  // Logo click → go to hero
  const logo = document.getElementById('nav-logo');
  if (logo) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', () => {
      if (isTransitioning) return;
      triggerAirlockTransition('hero', 'Home');
    });
  }

  // Next-section buttons
  document.querySelectorAll<HTMLButtonElement>('.section-next-btn').forEach((btn) => {
    const targetId = btn.dataset.target!;
    const label = SECTION_LABELS[targetId] ?? targetId;
    btn.addEventListener('click', () => triggerAirlockTransition(targetId, label));
  });
}

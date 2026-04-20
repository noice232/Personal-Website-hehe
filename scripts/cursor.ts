/**
 * cursor.ts
 * Custom cursor (dot + lagging ring) and magnetic button effect.
 * Only activates on hover-capable (non-touch) devices.
 */

const isHoverDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (!isHoverDevice) {
  // Touch device — bail out, leave default cursor
  // Export a no-op so imports don't break
} else {
  initCursor();
}

function initCursor(): void {
  const dot  = document.getElementById('cursor-dot')  as HTMLElement;
  const ring = document.getElementById('cursor-ring') as HTMLElement;
  if (!dot || !ring) return;

  // Hide default cursor
  document.body.classList.add('custom-cursor');

  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;
  let rafId: number;

  // Update dot instantly on mousemove
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top  = `${mouseY}px`;
  });

  // Ring follows with lerp (lazy trailing)
  function animateRing(): void {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    ring.style.left = `${ringX}px`;
    ring.style.top  = `${ringY}px`;
    rafId = requestAnimationFrame(animateRing);
  }
  rafId = requestAnimationFrame(animateRing);

  // Click feedback
  document.addEventListener('mousedown', () => dot.classList.add('clicking'));
  document.addEventListener('mouseup',   () => dot.classList.remove('clicking'));

  // Hover expansion on interactive elements
  const interactiveSelector = 'a, button, [role="button"], .project-card, .skill-tag, .contact-item, .highlight-chip, .interest-tag';

  document.addEventListener('mouseover', (e) => {
    if ((e.target as Element).closest(interactiveSelector)) {
      ring.classList.add('hovered');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if ((e.target as Element).closest(interactiveSelector)) {
      ring.classList.remove('hovered');
    }
  });

  // Hide cursor when it leaves the window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '0.55';
  });
}

// ── Magnetic hover buttons ──────────────────────────────────
export function initMagneticButtons(): void {
  const RADIUS = 70; // px from center — magnetic zone
  const STRENGTH = 0.30; // how far the button shifts (0–1)

  document.querySelectorAll<HTMLElement>('.btn-primary, .btn-secondary, .btn-resume').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < RADIUS) {
        const tx = dx * STRENGTH;
        const ty = dy * STRENGTH;
        btn.style.transform = `translate(${tx}px, ${ty}px)`;
      }
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

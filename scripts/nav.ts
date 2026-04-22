/**
 * nav.ts
 * Navbar: show/hide, active section links, hamburger menu.
 */

const navbar     = document.getElementById('navbar')      as HTMLElement;
const navLinks   = document.querySelectorAll<HTMLAnchorElement>('#nav-links a');
const hamburger  = document.getElementById('hamburger')   as HTMLButtonElement | null;
const mobileMenu = document.getElementById('nav-mobile-menu') as HTMLElement | null;
const mobileLinks = document.querySelectorAll<HTMLAnchorElement>('#nav-mobile-menu a');

// ── Show navbar (called by hero.ts after settle) ────────────
export function showNav(): void {
  navbar.classList.add('visible');
}

// ── Active section highlighting ─────────────────────────────
const NAV_SECTION_IDS = ['about', 'timeline', 'projects', 'skills', 'contact'];

const SECTION_LABELS: Record<string, string> = {
  about:    'About',
  timeline: 'Journey',
  projects: 'Projects',
  skills:   'Tech Stack',
  contact:  'Contact',
};

const sectionLabelSide = document.getElementById('section-label-side');

function getActiveSectionId(): string {
  const scrollY = window.scrollY + window.innerHeight * 0.25;
  let activeId = NAV_SECTION_IDS[0];
  for (const id of NAV_SECTION_IDS) {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollY) {
      activeId = id;
    }
  }
  return activeId;
}

function updateActiveState(): void {
  const activeId = getActiveSectionId();

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === `#${activeId}`);
  });

  if (sectionLabelSide) {
    const label = SECTION_LABELS[activeId] ?? '';
    sectionLabelSide.textContent = label;
    sectionLabelSide.classList.toggle('visible', !!label);
  }
}

window.addEventListener('scroll', updateActiveState, { passive: true });
document.addEventListener('DOMContentLoaded', updateActiveState);
updateActiveState();

// ── Hamburger menu ───────────────────────────────────────────
function initHamburger(): void {
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });

  // Close on link click
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target as Node) && !mobileMenu.contains(e.target as Node)) {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    }
  });
}

initHamburger();

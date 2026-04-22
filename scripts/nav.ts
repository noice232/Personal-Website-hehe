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
function setActiveById(id: string): void {
  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
  });
}

window.addEventListener('section-change', (e: Event) => {
  setActiveById((e as CustomEvent<{ id: string }>).detail.id);
});

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

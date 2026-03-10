/**
 * nav.ts
 * Manages the navbar: show/hide, active section highlighting via IntersectionObserver.
 */

const navbar = document.getElementById('navbar') as HTMLElement;
const navLinks = document.querySelectorAll<HTMLAnchorElement>('#nav-links a');

/**
 * Reveal the navbar. Called by hero.ts after the settle animation completes.
 */
export function showNav(): void {
  navbar.classList.add('visible');
}

/**
 * Update the active nav link based on which section is in view.
 */
function initActiveLinks(): void {
  const sections = document.querySelectorAll<HTMLElement>('section[id]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    {
      rootMargin: '-40% 0px -50% 0px',
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

initActiveLinks();

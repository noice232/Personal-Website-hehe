/**
 * scroll.ts
 * Scroll-reveal with staggered grid support.
 * Self-initializing — no exports needed.
 */

function initScrollReveal(): void {
  const revealEls = document.querySelectorAll<HTMLElement>('.reveal');
  if (revealEls.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target as HTMLElement;

        // If inside a .stagger-grid parent, stagger is handled by CSS
        // transition-delay — just add the class and the CSS does the rest
        el.classList.add('revealed');
        observer.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
}

initScrollReveal();

/**
 * scroll.ts
 * Scroll-reveal: observes all .reveal elements and adds .revealed when they enter the viewport.
 * Self-initializing — no exports needed.
 */

function initScrollReveal(): void {
  const revealElements = document.querySelectorAll<HTMLElement>('.reveal');

  if (revealElements.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Once revealed, stop observing to save resources
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

// Run after DOM is ready (this script is imported by hero.ts which is deferred)
initScrollReveal();

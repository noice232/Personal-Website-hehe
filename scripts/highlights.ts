/**
 * highlights.ts — zanebeeai-style full-width carousel
 */

(function () {
  const viewport = document.querySelector<HTMLElement>('.hl-viewport');
  const track    = document.getElementById('hl-track') as HTMLElement | null;
  const dotEls   = Array.from(document.querySelectorAll<HTMLElement>('.hl-dot'));

  if (!viewport || !track || !dotEls.length) return;

  const cards = Array.from(track.querySelectorAll<HTMLElement>('.hl-card'));
  const N   = cards.length;
  const GAP = 24; // must match CSS gap
  let cur   = 0;
  let autoId: number;
  let startX    = 0;
  let dragging  = false;

  function calcOffset(i: number): number {
    const vW = viewport!.offsetWidth;
    const cW = cards[0].offsetWidth;
    return (vW - cW) / 2 - i * (cW + GAP);
  }

  function goTo(i: number, animate = true): void {
    cards[cur].classList.remove('active');
    dotEls[cur].classList.remove('active');
    cur = ((i % N) + N) % N;
    cards[cur].classList.add('active');
    dotEls[cur].classList.add('active');
    track!.style.transition = animate
      ? 'transform 0.65s cubic-bezier(0.77, 0, 0.175, 1)'
      : 'none';
    track!.style.transform = `translateX(${calcOffset(cur)}px)`;
  }

  // Initial position — no animation
  goTo(0, false);

  // Dot clicks
  dotEls.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); resetAuto(); });
  });

  // Click adjacent cards to navigate
  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (i !== cur) { goTo(i); resetAuto(); }
    });
  });

  // Auto-advance
  function resetAuto(): void {
    clearInterval(autoId);
    autoId = window.setInterval(() => goTo(cur + 1), 4500);
  }
  resetAuto();

  // Mouse drag
  viewport.addEventListener('mousedown', (e) => {
    startX   = e.clientX;
    dragging = true;
  });
  viewport.addEventListener('mousemove', (e) => {
    if (dragging) e.preventDefault();
  }, { passive: false });
  viewport.addEventListener('mouseup', (e) => {
    if (!dragging) return;
    dragging = false;
    if (Math.abs(e.clientX - startX) > 60) {
      goTo(e.clientX < startX ? cur + 1 : cur - 1);
      resetAuto();
    }
  });
  viewport.addEventListener('mouseleave', () => { dragging = false; });

  // Touch swipe
  viewport.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });
  viewport.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) { goTo(dx < 0 ? cur + 1 : cur - 1); resetAuto(); }
  }, { passive: true });

  // Recalculate on resize
  window.addEventListener('resize', () => {
    track!.style.transition = 'none';
    track!.style.transform  = `translateX(${calcOffset(cur)}px)`;
  });
})();

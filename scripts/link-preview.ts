export function initLinkPreviews(): void {
  const preview = document.createElement('div');
  preview.id = 'link-thumb-preview';
  const img = document.createElement('img');
  img.alt = '';
  preview.appendChild(img);
  document.body.appendChild(preview);

  document.querySelectorAll<HTMLAnchorElement>('a[data-thumb]').forEach((link) => {
    link.addEventListener('mouseenter', (e) => {
      img.src = link.dataset.thumb!;
      preview.classList.add('visible');
      reposition(e as MouseEvent);
    });
    link.addEventListener('mousemove', reposition);
    link.addEventListener('mouseleave', () => preview.classList.remove('visible'));
  });

  function reposition(e: MouseEvent): void {
    const gap = 14;
    const pw  = preview.offsetWidth  || 220;
    const ph  = preview.offsetHeight || 140;
    let x = e.clientX + gap;
    let y = e.clientY - ph / 2;
    if (x + pw > window.innerWidth  - 8) x = e.clientX - pw - gap;
    if (y < 8)                           y = 8;
    if (y + ph > window.innerHeight - 8) y = window.innerHeight - ph - 8;
    preview.style.left = `${x}px`;
    preview.style.top  = `${y}px`;
  }
}

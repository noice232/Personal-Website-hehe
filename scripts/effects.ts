/**
 * effects.ts
 * Spotlight, typewriter tagline, text scramble on headings,
 * 3D card tilt, theme toggle, stats counter, parallax on hero photo,
 * swipe gestures for slideshow (called from hero.ts),
 * and sticky section side label.
 */

// ── Typewriter tagline ──────────────────────────────────────
export function initTypewriter(): void {
  const el = document.getElementById('hero-tagline');
  if (!el) return;

  const phrases = [
    'CS @ Waterloo. ICPC national champion. I build things that matter.',
    'Machine learning engineer in training.',
    'Hackathon builder. Curious by default.',
    'Turning caffeine and ideas into software.',
    'Systems thinker. Occasional insomniac.',
  ];

  let phraseIndex = 0;
  let charIndex   = 0;
  let deleting    = false;
  let timeoutId: ReturnType<typeof setTimeout>;

  function tick(): void {
    const current = phrases[phraseIndex];

    if (deleting) {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        timeoutId = setTimeout(tick, 500);
        return;
      }
      timeoutId = setTimeout(tick, 28);
    } else {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        // Pause at full phrase, then delete
        timeoutId = setTimeout(() => {
          deleting = true;
          tick();
        }, 2800);
        return;
      }
      timeoutId = setTimeout(tick, 48);
    }
  }

  // Start after first phrase fully types in
  el.textContent = '';
  timeoutId = setTimeout(tick, 200);
}

// ── Text scramble on section headings ──────────────────────
const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#$@ABCDEFabcdef0123456789';

export function scrambleText(el: HTMLElement): void {
  const original  = el.dataset.originalText ?? el.textContent ?? '';
  el.dataset.originalText = original;

  let frame = 0;
  const totalFrames = original.length * 3; // ~90ms per char at 30fps

  function update(): void {
    const progress = frame / totalFrames;
    const resolved = Math.floor(progress * original.length);

    el.textContent = original
      .split('')
      .map((char, i) => {
        if (char === ' ') return ' ';
        if (i < resolved) return char;
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      })
      .join('');

    frame++;
    if (frame <= totalFrames) requestAnimationFrame(update);
    else el.textContent = original;
  }

  requestAnimationFrame(update);
}

export function initScrambleObserver(): void {
  const headings = document.querySelectorAll<HTMLElement>('h2.scramble, h3.scramble');
  if (headings.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          scrambleText(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  headings.forEach((h) => observer.observe(h));
}

// ── 3D card tilt ────────────────────────────────────────────
export function initCardTilt(): void {
  const MAX_TILT = 8;

  document.querySelectorAll<HTMLElement>('.project-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform =
        `perspective(800px) translateY(-4px) rotateX(${y * -MAX_TILT}deg) rotateY(${x * MAX_TILT}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  const SKILL_TILT = 35;

  document.querySelectorAll<HTMLElement>('.skill-tag').forEach((tag) => {
    tag.addEventListener('mousemove', (e) => {
      const rect = tag.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      tag.style.transform =
        `perspective(120px) translateY(-8px) rotateX(${y * -SKILL_TILT}deg) rotateY(${x * SKILL_TILT}deg) scale(1.08)`;
    });

    tag.addEventListener('mouseleave', () => {
      tag.style.transform = '';
    });
  });
}

// ── Theme toggle ────────────────────────────────────────────
export function initThemeToggle(): void {
  const btn  = document.getElementById('theme-toggle');
  const html = document.documentElement;
  if (!btn) return;

  btn.addEventListener('click', () => {
    const isDark = html.getAttribute('data-theme') === 'dark';
    if (isDark) {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', 'dark');
    }
  });
}

// ── Stats counter ───────────────────────────────────────────
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function countUp(el: HTMLElement, target: number, duration = 1400): void {
  const start = performance.now();

  function tick(now: number): void {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    el.textContent = Math.round(easeOutQuart(progress) * target).toString();
    if (progress < 1) requestAnimationFrame(tick);
    else {
      el.textContent = target.toString();
      el.style.animation = 'statPop 0.3s ease';
    }
  }

  requestAnimationFrame(tick);
}

export function initStatsCounter(): void {
  const stats = document.querySelectorAll<HTMLElement>('.stat-number[data-target]');
  if (stats.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el     = entry.target as HTMLElement;
          const target = parseInt(el.dataset.target ?? '0', 10);
          countUp(el, target);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.3 }
  );

  stats.forEach((s) => {
    s.textContent = '0';
    observer.observe(s);
  });
}

// ── Mouse parallax on hero photo ───────────────────────────
export function initHeroParallax(): void {
  const heroRight = document.getElementById('hero-right');
  if (!heroRight) return;
  if (!window.matchMedia('(hover: hover)').matches) return;

  const DEPTH = 10; // max px offset

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx; // -1..1
    const dy = (e.clientY - cy) / cy;
    heroRight.style.marginLeft = `${dx * DEPTH}px`;
    heroRight.style.marginTop  = `${dy * DEPTH}px`;
  });
}

// ── Scroll progress bar ─────────────────────────────────────
export function initScrollProgress(): void {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const total = document.body.scrollHeight - window.innerHeight;
    const pct   = total > 0 ? (window.scrollY / total) * 100 : 0;
    bar.style.width = `${pct}%`;
  }, { passive: true });
}

// ── Footer year ─────────────────────────────────────────────
export function initFooterYear(): void {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear().toString();
}

// ── Resume buttons: open in new tab + trigger download ──────
function initResumeButtons(): void {
  const RESUME_URL = 'assets/Yash_Resume_CA.pdf';

  document.querySelectorAll<HTMLElement>('.btn-resume, .contact-item--resume').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(RESUME_URL, '_blank', 'noopener');
      const a = document.createElement('a');
      a.href = RESUME_URL;
      a.download = 'Yash_Sah_Resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  });
}

// ── Init all effects ────────────────────────────────────────
// ── Mobile dark mode default ────────────────────────────────
function applyMobileDarkDefault(): void {
  if (window.innerWidth <= 900) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

export function initAllEffects(): void {
  applyMobileDarkDefault();
  initThemeToggle();
  initScrollProgress();
  initCardTilt();
  initHeroParallax();
  initFooterYear();
  initResumeButtons();
}

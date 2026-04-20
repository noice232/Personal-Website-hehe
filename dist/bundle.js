"use strict";
(() => {
  // scripts/nav.ts
  var navbar = document.getElementById("navbar");
  var navLinks = document.querySelectorAll("#nav-links a");
  var hamburger = document.getElementById("hamburger");
  var mobileMenu = document.getElementById("nav-mobile-menu");
  var mobileLinks = document.querySelectorAll("#nav-mobile-menu a");
  function showNav() {
    navbar.classList.add("visible");
  }
  function initActiveLinks() {
    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach((link) => {
              link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
  }
  function initHamburger() {
    if (!hamburger || !mobileMenu)
      return;
    hamburger.addEventListener("click", () => {
      const open = hamburger.classList.toggle("open");
      mobileMenu.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", String(open));
    });
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("open");
        mobileMenu.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("click", (e) => {
      if (!navbar.contains(e.target) && !mobileMenu.contains(e.target)) {
        hamburger.classList.remove("open");
        mobileMenu.classList.remove("open");
      }
    });
  }
  initActiveLinks();
  initHamburger();

  // scripts/scroll.ts
  function initScrollReveal() {
    const revealEls = document.querySelectorAll(".reveal");
    if (revealEls.length === 0)
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting)
            return;
          const el = entry.target;
          el.classList.add("revealed");
          observer.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  }
  initScrollReveal();

  // scripts/cursor.ts
  var isHoverDevice = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!isHoverDevice) {
  } else {
    initCursor();
  }
  function initCursor() {
    const dot = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");
    if (!dot || !ring)
      return;
    document.body.classList.add("custom-cursor");
    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let rafId;
    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    });
    function animateRing() {
      ringX += (mouseX - ringX) * 0.14;
      ringY += (mouseY - ringY) * 0.14;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      rafId = requestAnimationFrame(animateRing);
    }
    rafId = requestAnimationFrame(animateRing);
    document.addEventListener("mousedown", () => dot.classList.add("clicking"));
    document.addEventListener("mouseup", () => dot.classList.remove("clicking"));
    const interactiveSelector = 'a, button, [role="button"], .project-card, .skill-tag, .contact-item, .highlight-chip, .interest-tag';
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(interactiveSelector)) {
        ring.classList.add("hovered");
      }
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(interactiveSelector)) {
        ring.classList.remove("hovered");
      }
    });
    document.addEventListener("mouseleave", () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
      dot.style.opacity = "1";
      ring.style.opacity = "0.55";
    });
  }
  function initMagneticButtons() {
    const RADIUS = 70;
    const STRENGTH = 0.3;
    document.querySelectorAll(".btn-primary, .btn-secondary, .btn-resume").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < RADIUS) {
          const tx = dx * STRENGTH;
          const ty = dy * STRENGTH;
          btn.style.transform = `translate(${tx}px, ${ty}px)`;
        }
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  // scripts/effects.ts
  function initSpotlight() {
    const el = document.getElementById("spotlight");
    if (!el)
      return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      el.style.display = "none";
      return;
    }
    document.addEventListener("mousemove", (e) => {
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
    });
  }
  function initTypewriter() {
    const el = document.getElementById("hero-tagline");
    if (!el)
      return;
    const phrases = [
      "CS @ Waterloo. I build things I find interesting.",
      "Machine learning engineer in training.",
      "Hackathon builder. Curious by default.",
      "Turning caffeine and ideas into software.",
      "Systems thinker. Occasional insomniac."
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeoutId;
    function tick() {
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
          timeoutId = setTimeout(() => {
            deleting = true;
            tick();
          }, 2800);
          return;
        }
        timeoutId = setTimeout(tick, 48);
      }
    }
    el.textContent = "";
    timeoutId = setTimeout(tick, 200);
  }
  var SCRAMBLE_CHARS = "!<>-_\\/[]{}\u2014=+*^?#$@ABCDEFabcdef0123456789";
  function scrambleText(el) {
    const original = el.dataset.originalText ?? el.textContent ?? "";
    el.dataset.originalText = original;
    let frame = 0;
    const totalFrames = original.length * 3;
    function update() {
      const progress = frame / totalFrames;
      const resolved = Math.floor(progress * original.length);
      el.textContent = original.split("").map((char, i) => {
        if (char === " ")
          return " ";
        if (i < resolved)
          return char;
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }).join("");
      frame++;
      if (frame <= totalFrames)
        requestAnimationFrame(update);
      else
        el.textContent = original;
    }
    requestAnimationFrame(update);
  }
  function initScrambleObserver() {
    const headings = document.querySelectorAll("h2.scramble, h3.scramble");
    if (headings.length === 0)
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            scrambleText(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    headings.forEach((h) => observer.observe(h));
  }
  function initCardTilt() {
    const MAX_TILT = 8;
    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) translateY(-4px) rotateX(${y * -MAX_TILT}deg) rotateY(${x * MAX_TILT}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }
  function initThemeToggle() {
    const btn = document.getElementById("theme-toggle");
    const html = document.documentElement;
    if (!btn)
      return;
    const saved = localStorage.getItem("theme");
    if (saved === "dark")
      html.setAttribute("data-theme", "dark");
    btn.addEventListener("click", () => {
      const isDark = html.getAttribute("data-theme") === "dark";
      if (isDark) {
        html.removeAttribute("data-theme");
        localStorage.removeItem("theme");
      } else {
        html.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      }
    });
  }
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }
  function countUp(el, target, duration = 1400) {
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(easeOutQuart(progress) * target).toString();
      if (progress < 1)
        requestAnimationFrame(tick);
      else {
        el.textContent = target.toString();
        el.style.animation = "statPop 0.3s ease";
      }
    }
    requestAnimationFrame(tick);
  }
  function initStatsCounter() {
    const stats = document.querySelectorAll(".stat-number[data-target]");
    if (stats.length === 0)
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target ?? "0", 10);
            countUp(el, target);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.6 }
    );
    stats.forEach((s) => observer.observe(s));
  }
  function initHeroParallax() {
    const heroRight2 = document.getElementById("hero-right");
    if (!heroRight2)
      return;
    if (!window.matchMedia("(hover: hover)").matches)
      return;
    const DEPTH = 10;
    document.addEventListener("mousemove", (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      heroRight2.style.marginLeft = `${dx * DEPTH}px`;
      heroRight2.style.marginTop = `${dy * DEPTH}px`;
    });
  }
  function initScrollProgress() {
    const bar = document.getElementById("scroll-progress");
    if (!bar)
      return;
    window.addEventListener("scroll", () => {
      const total = document.body.scrollHeight - window.innerHeight;
      const pct = total > 0 ? window.scrollY / total * 100 : 0;
      bar.style.width = `${pct}%`;
    }, { passive: true });
  }
  function initSideSectionLabel() {
    const label = document.getElementById("section-label-side");
    const sections = document.querySelectorAll("section[id]");
    if (!label || sections.length === 0)
      return;
    const sectionNames = {
      hero: "Intro",
      about: "About",
      timeline: "Journey",
      projects: "Projects",
      skills: "Skills",
      contact: "Contact"
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id") ?? "";
            const name = sectionNames[id] ?? id;
            label.textContent = name;
            label.classList.add("visible");
            if (id === "hero")
              label.classList.remove("visible");
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
  }
  function initFooterYear() {
    const el = document.getElementById("footer-year");
    if (el)
      el.textContent = (/* @__PURE__ */ new Date()).getFullYear().toString();
  }
  function initAllEffects() {
    initSpotlight();
    initThemeToggle();
    initScrollProgress();
    initScrambleObserver();
    initCardTilt();
    initStatsCounter();
    initHeroParallax();
    initSideSectionLabel();
    initFooterYear();
    initMagneticButtons();
  }

  // scripts/hero.ts
  var heroEl = document.getElementById("hero");
  var heroText = document.getElementById("hero-text");
  var wordHi = document.getElementById("word-hi");
  var wordIm = document.getElementById("word-im");
  var wordYash = document.getElementById("word-yash");
  var heroGradient = document.getElementById("hero-gradient");
  var heroRight = document.getElementById("hero-right");
  var heroLeftExtras = document.getElementById("hero-left-extras");
  var heroBadge = document.getElementById("hero-image-badge");
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function runHeroAnimation() {
    await delay(300);
    wordHi.classList.add("word-visible");
    await delay(600);
    wordIm.classList.add("word-visible");
    await delay(600);
    wordYash.classList.add("word-visible");
    await delay(1500);
    settleHero();
  }
  function settleHero() {
    heroText.style.transition = [
      "left 0.8s var(--ease-out)",
      "top 0.8s var(--ease-out)",
      "transform 0.8s var(--ease-out)",
      "font-size 0.8s var(--ease-out)"
    ].join(", ");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        heroText.style.left = "10vw";
        heroText.style.top = "50%";
        heroText.style.transform = "translateY(-50%)";
        heroText.style.fontSize = "clamp(1.8rem, 3.5vw, 3rem)";
      });
    });
    setTimeout(() => heroGradient.classList.add("settling"), 100);
    setTimeout(() => heroRight.classList.add("slide-in"), 400);
    setTimeout(() => {
      const textRect = heroText.getBoundingClientRect();
      const heroRect = heroEl.getBoundingClientRect();
      heroLeftExtras.style.top = `${textRect.bottom - heroRect.top + 20}px`;
      if (window.innerWidth <= 900) {
        heroLeftExtras.style.left = "50%";
        heroLeftExtras.style.transform = "translateX(-50%)";
      }
      heroLeftExtras.classList.add("active");
    }, 820);
    setTimeout(() => showNav(), 900);
    setTimeout(() => {
      initSlideshow();
      if (heroBadge)
        heroBadge.classList.add("visible");
    }, 1200);
    setTimeout(() => {
      [wordHi, wordIm, wordYash].forEach((word) => {
        word.style.opacity = "1";
        word.style.transform = "none";
        word.style.animation = "textGlisten 4s ease-in-out infinite";
      });
      initTypewriter();
    }, 1400);
  }
  function initSlideshow() {
    const slides = Array.from(
      document.querySelectorAll("#hero-slideshow .slide")
    );
    if (slides.length <= 1)
      return;
    let current = 0;
    let paused = false;
    let intervalId;
    function advance() {
      if (paused)
        return;
      const prev2 = current;
      current = (current + 1) % slides.length;
      slides[prev2].classList.add("slide-exiting");
      slides[prev2].classList.remove("slide-active");
      slides[current].classList.add("slide-active");
      setTimeout(() => {
        const el = slides[prev2];
        el.style.transitionDuration = "0ms";
        el.classList.remove("slide-exiting");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transitionDuration = "";
          });
        });
      }, 520);
    }
    function prev() {
      if (paused)
        return;
      const old = current;
      current = (current - 1 + slides.length) % slides.length;
      slides[old].classList.remove("slide-active");
      slides[current].style.transitionDuration = "0ms";
      slides[current].classList.remove("slide-exiting");
      slides[current].style.transform = "translateX(-100%)";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          slides[current].style.transitionDuration = "";
          slides[current].style.transform = "";
          slides[current].classList.add("slide-active");
        });
      });
    }
    intervalId = setInterval(advance, 3500);
    const container = document.getElementById("hero-slideshow");
    if (container) {
      container.addEventListener("mouseenter", () => {
        paused = true;
      });
      container.addEventListener("mouseleave", () => {
        paused = false;
      });
    }
    let touchStartX = 0;
    const wrapper = document.getElementById("hero-image-wrapper");
    if (wrapper) {
      wrapper.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });
      wrapper.addEventListener("touchend", (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          clearInterval(intervalId);
          if (diff > 0)
            advance();
          else
            prev();
          intervalId = setInterval(advance, 3500);
        }
      }, { passive: true });
    }
  }
  requestAnimationFrame(() => {
    initAllEffects();
    runHeroAnimation();
  });
})();

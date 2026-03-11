"use strict";
(() => {
  // scripts/nav.ts
  var navbar = document.getElementById("navbar");
  var navLinks = document.querySelectorAll("#nav-links a");
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
      {
        rootMargin: "-40% 0px -50% 0px",
        threshold: 0
      }
    );
    sections.forEach((section) => observer.observe(section));
  }
  initActiveLinks();

  // scripts/scroll.ts
  function initScrollReveal() {
    const revealElements = document.querySelectorAll(".reveal");
    if (revealElements.length === 0)
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px"
      }
    );
    revealElements.forEach((el) => observer.observe(el));
  }
  initScrollReveal();

  // scripts/hero.ts
  var heroEl = document.getElementById("hero");
  var heroText = document.getElementById("hero-text");
  var wordHi = document.getElementById("word-hi");
  var wordIm = document.getElementById("word-im");
  var wordYash = document.getElementById("word-yash");
  var heroGradient = document.getElementById("hero-gradient");
  var heroRight = document.getElementById("hero-right");
  var heroLeftExtras = document.getElementById("hero-left-extras");
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function runHeroAnimation() {
    await delay(300);
    wordHi.classList.add("word-visible");
    await delay(500);
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
    setTimeout(() => {
      heroGradient.classList.add("settling");
    }, 100);
    setTimeout(() => {
      heroRight.classList.add("slide-in");
    }, 400);
    setTimeout(() => {
      const textRect = heroText.getBoundingClientRect();
      const heroRect = heroEl.getBoundingClientRect();
      const extrasTop = textRect.bottom - heroRect.top + 20;
      heroLeftExtras.style.top = `${extrasTop}px`;
      if (window.innerWidth <= 900) {
        heroLeftExtras.style.left = "50%";
        heroLeftExtras.style.transform = "translateX(-50%)";
      }
      heroLeftExtras.classList.add("active");
    }, 820);
    setTimeout(() => {
      showNav();
    }, 900);
    setTimeout(() => {
      initSlideshow();
    }, 1200);
    setTimeout(() => {
      [wordHi, wordIm, wordYash].forEach((word) => {
        word.style.opacity = "1";
        word.style.transform = "none";
        word.style.animation = "textGlisten 3.8s ease-in-out infinite";
      });
    }, 1400);
  }
  function initSlideshow() {
    const slides = Array.from(
      document.querySelectorAll("#hero-slideshow .slide")
    );
    if (slides.length <= 1)
      return;
    let current = 0;
    function advance() {
      const prev = current;
      current = (current + 1) % slides.length;
      slides[prev].classList.add("slide-exiting");
      slides[prev].classList.remove("slide-active");
      slides[current].classList.add("slide-active");
      setTimeout(() => {
        const el = slides[prev];
        el.style.transitionDuration = "0ms";
        el.classList.remove("slide-exiting");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transitionDuration = "";
          });
        });
      }, 520);
    }
    setInterval(advance, 3e3);
  }
  requestAnimationFrame(() => {
    runHeroAnimation();
  });
})();

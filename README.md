# Yash Sah — Portfolio

Personal portfolio site. Vanilla TypeScript, no frameworks.

**Live:** [yash-sah.vercel.app](https://yash-sah.vercel.app)

---

## Stack

| Layer | Tool |
|---|---|
| Language | TypeScript |
| Bundler | Vite |
| 3D / Canvas | Three.js |
| Styling | Vanilla CSS (custom properties) |
| Deployment | Vercel |

## Structure

```
scripts/
  hero.ts          # Hero animation sequence + carousel
  canvas.ts        # Three.js background canvas
  airlock.ts       # Section switching (no-scroll layout)
  highlights.ts    # Full-width highlights carousel
  text-blend.ts    # Blend-mode title overlay
  link-preview.ts  # Hover preview thumbnails on project links
  cursor.ts        # Custom cursor
  nav.ts           # Navbar show/hide
  effects.ts       # Film grain + misc visual effects
  scroll.ts        # Scroll utilities
  wheel-nav.ts     # Mousewheel section navigation

styles/            # Per-section CSS, custom properties in variables.css
assets/            # Photos used in the hero carousel
```

## Local dev

```bash
npm install
npm run dev
```

```bash
npm run build    # production bundle → dist/
npm run preview  # preview the build locally
```

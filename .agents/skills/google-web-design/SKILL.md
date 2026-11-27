---
name: google-web-design
description: >-
  Use this skill for Google web design guidelines, Core Web Vitals optimization,
  responsive layout fluidity, progressive enhancement, and modern web ergonomics.
---

# Google Web Design Guidelines: Core Web Vitals & Ergonomics

Inspired by `google/web-design-guidelines` and Google Material 3 web principles, this skill ensures peak web performance, responsive fluidity, and ergonomic interaction design.

## 1. Core Web Vitals Optimization

### Largest Contentful Paint (LCP < 2.5s)
- **Preload Critical Assets:** Preload primary hero images, background textures, and web fonts in `index.html`.
- **Image Optimization:** Serve responsive modern formats (WebP / AVIF) with appropriate `loading="eager"` for above-the-fold assets and `loading="lazy"` for below-the-fold content.
- **Avoid Render-Blocking Layout Shifts:** Reserve aspect-ratio containers (`aspect-video`, `aspect-square`, or explicit height) for dynamic content to prevent layout shifts.

### Interaction to Next Paint (INP < 200ms)
- **Debounce Heavy Computations:** Keep event handlers lean. For search inputs and stroke canvas rendering, avoid blocking the main JavaScript thread.
- **CSS Transitions over JS Animation Loops:** Prefer hardware-accelerated CSS transforms (`translate3d`, `scale`, `opacity`) via Tailwind / Motion instead of modifying `top`, `left`, `width`, or `height`.

### Cumulative Layout Shift (CLS < 0.1)
- **Decoupled Column Heights:** Avoid layout snapping where expanding one card causes adjacent columns to stretch or deform unexpectedly.
- **Fixed Skeleton Placeholders:** Use animated pulse skeleton boxes matching the exact dimensions of incoming API data.

## 2. Responsive Fluidity & Mobile Ergonomics

- **Fluid Typography:** Use modern fluid clamp scaling (`clamp(1.5rem, 4vw, 2.5rem)`) or responsive Tailwind typography (`text-2xl sm:text-3xl lg:text-4xl`) for effortless scaling across phones, tablets, and wide monitors.
- **Safe Area Insets:** Account for mobile notches and bottom home indicator bars:
  `pb-[max(1rem,env(safe-area-inset-bottom))]`
- **Breakpoints Discipline:**
  - Mobile (< 640px): 1-column layouts, sticky bottom actions, larger touch targets.
  - Tablet (640px–1024px): 2-column grids, balanced folder tabs.
  - Desktop (> 1024px): 3-column grids, multi-layer ambient background art, generous scholar whitespace.

## 3. Motion Choreography (Material Design 3 Principles)

- **Purposeful Motion:** Every animation must guide user attention or reinforce state changes. Avoid gratuitous spinning or bouncing.
- **Natural Easing:** Use cubic-bezier curves that mimic physical inertia:
  `cubic-bezier(0.2, 0.0, 0, 1)` (Material Decelerate) for entering elements.
- **Speed & Duration:**
  - Micro-interactions (hover, active press): 150ms–200ms.
  - State transitions (tab switch, modal open): 200ms–300ms.
  - Never exceed 400ms for UI feedback, as it makes the interface feel sluggish.


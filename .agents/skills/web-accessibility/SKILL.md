---
name: web-accessibility
description: >-
  Use this skill to ensure all web components comply with W3C WCAG 2.2 accessibility standards,
  semantic HTML, keyboard operability, color contrast, and ARIA attributes.
---

# Web Accessibility: W3C WCAG 2.2 AA Standards

Inspired by `w3c/skill@web-accessibility`, this skill enforces rigorous accessibility standards across all components and user flows.

## 1. The Four WCAG Principles (POUR)

### Principle 1: Perceivable
- **Color Contrast Ratios:**
  - Normal text (< 18pt / < 14pt bold): Minimum **4.5:1** contrast ratio against its background.
  - Large text (≥ 18pt / ≥ 14pt bold): Minimum **3:1** contrast ratio.
  - UI components and graphical objects (borders, icons): Minimum **3:1** contrast ratio.
- **Text Alternatives:**
  - Every icon-only button must have an explicit `aria-label` (e.g. `<button aria-label="Play pronunciation for 学">`).
  - Decorative background graphics (SVGs, watermarks, mist) must have `aria-hidden="true"` and `pointer-events-none`.

### Principle 2: Operable
- **Full Keyboard Navigation:**
  - Every interactive element must be reachable and operable using `Tab`, `Shift+Tab`, `Enter`, and `Space`.
  - Never remove focus rings without providing an alternative:
    `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar focus-visible:ring-offset-2`
- **Touch Target Sizes (Mobile):**
  - Minimum touch target size of **44px × 44px** (or minimum `size-11` / `p-2.5` touch padding) to prevent accidental taps.

### Principle 3: Understandable
- **Predictable Behavior:**
  - Selecting an option in a quiz must never trigger unexpected page redirection or layout shifts.
  - Form validation errors must clearly describe what went wrong and how to fix it.
- **Language & Pronunciation:**
  - Pinyin annotations must have clear text hierarchy and proper phonetic tonal marks.

### Principle 4: Robust
- **Semantic HTML Elements:**
  - Use native HTML elements: `<button>` for actions, `<a>` / `<Link>` for navigation, `<section>`, `<article>`, `<header>`, `<footer>`, `<nav>`, `<aside>`.
  - Avoid `<div onClick={...}>` without `role="button"` and `tabIndex={0}`.
- **Live Regions for Dynamic Feedback:**
  - Dynamic score counters, toasts, and quiz explanations should use `aria-live="polite"` so screen readers announce changes without interrupting the user.

## 2. React Component Accessibility Checklist

- [ ] All interactive buttons have visible `:hover`, `:focus-visible`, and `:active` states.
- [ ] Sound buttons have descriptive `aria-label` tags.
- [ ] Modals lock background scroll and trap keyboard focus.
- [ ] Tabs communicate active state via `aria-selected="true"` and `role="tab"`.
- [ ] Images have meaningful `alt` attributes or empty `alt=""` for decorative illustrations.


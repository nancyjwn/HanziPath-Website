---
name: transitions-dev
description: >-
  Use this skill for implementing buttery-smooth, accessible, 60fps UI transitions,
  micro-interactions, and motion choreography based on transitions.dev by Jakub Antalik.
---

# Transitions.dev: Production-Ready UI Motion & Micro-Interactions

Inspired by `jakubantalik/transitions.dev`, this skill brings 43+ curated, accessible, and high-performance UI motion patterns to web interfaces, ensuring every interaction feels fluid, physical, and responsive.

## 1. Core Principles of transitions.dev

1. **Compositor-Only Animations (60/120 FPS):**
   - Strictly animate **`transform`** (`translate3d`, `scale`, `rotate`) and **`opacity`**.
   - Never animate layout-triggering properties (`width`, `height`, `top`, `left`, `margin`, `padding`), as they cause browser reflows and jank.
2. **Intentional Timing & Easing Curves:**
   - **Enter / Reveal (Decelerate):** `cubic-bezier(0.16, 1, 0.3, 1)` or `ease-out` (200ms–280ms) — feels snappy, arriving with speed and softly settling.
   - **Exit / Dismiss (Accelerate):** `cubic-bezier(0.7, 0, 0.84, 0)` or `ease-in` (150ms–200ms) — leaves the screen quickly without lagging.
   - **Tactile / Spring (Bouncy):** Motion `stiffness: 350, damping: 25` for hover lifts and button presses.
3. **Accessibility First (`prefers-reduced-motion`):**
   - Always honor user motion sensitivity:
     ```css
     @media (prefers-reduced-motion: reduce) {
       *, ::before, ::after {
         animation-duration: 0.01ms !important;
         transition-duration: 0.01ms !important;
       }
     }
     ```
   - In React / Motion: Use `useReducedMotion()` or graceful opacity-only fallbacks.

## 2. Curated UI Motion Patterns

### Pattern 1: Tactile Button & Card Press (`active:scale-[0.98]`)
Every clickable element must compress slightly upon click and recover immediately:
```jsx
// React / Motion
<motion.button
  whileHover={{ y: -2, scale: 1.01 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
  className="cursor-pointer transition-colors"
>
```

### Pattern 2: Dialog & Modal Backdrop Reveal
Smooth backdrop blur fade paired with a subtle scale-up from 96% to 100%:
```jsx
// Backdrop:
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}

// Dialog Container:
initial={{ opacity: 0, scale: 0.96, y: 8 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.97, y: 4 }}
transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
```

### Pattern 3: Tab Underline Morphing (`layoutId`)
When switching active tabs, rather than popping in, the active indicator glides physically across the tabs:
```jsx
{isActive && (
  <motion.span
    layoutId="tabUnderline"
    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-cinnabar rounded-full"
  />
)}
```

### Pattern 4: Step / Question Transition (`AnimatePresence mode="wait"`)
Content swaps smoothly with directional slide and cross-fade without layout jitter:
```jsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentStep}
    initial={{ opacity: 0, x: 12 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -12 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
  >
    {/* Question / Step Content */}
  </motion.div>
</AnimatePresence>
```

### Pattern 5: Error Shake & Success Pulse
- **Error Shake:** A gentle, high-frequency horizontal dampening shake:
  ```jsx
  animate={isShaking ? { x: [-3, 3, -2, 2, -1, 1, 0] } : {}}
  transition={{ duration: 0.35, ease: 'easeInOut' }}
  ```
- **Success Seal / Badge:** Scale punch (`scale: [0.8, 1.06, 1]`) with celadon green glow.

### Pattern 6: Floating Cursor Follower (Pill)
Lagged spring follower that tracks mouse coordinates smoothly with zero jitter:
```jsx
<motion.div
  style={{
    x: cursorXSpring,
    y: cursorYSpring,
    translateX: '-50%',
    translateY: '-50%'
  }}
  className="pointer-events-none fixed z-50 rounded-full px-4 py-1.5 shadow-md"
/>
```

## 3. Motion Checklist for New Components

- [ ] Does every hover interaction feel responsive (< 150ms delay)?
- [ ] Are animations hardware-accelerated (`transform` / `opacity` only)?
- [ ] Is `mode="wait"` used in `AnimatePresence` where simultaneous entering/exiting would break layout height?
- [ ] Is motion disabled or softened when `prefers-reduced-motion` is active?
- [ ] Does motion serve a clear communicative purpose (orienting the user, confirming action)?


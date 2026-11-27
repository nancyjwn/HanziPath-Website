---
name: shadcn-ui-craft
description: >-
  Use this skill for implementing accessible, composable, beautifully crafted UI components
  based on shadcn/ui and Radix UI patterns in React and Tailwind CSS.
---

# shadcn/ui Craft: Composable Component Architecture

Inspired by `ui.shadcn.com`, this skill provides architectural patterns for crafting accessible, high-performance, and copy-paste composable UI primitives in React and Tailwind CSS.

## 1. Architectural Philosophy

- **Ownership Over Black Boxes:** Components live directly in your codebase (`src/components/ui/`), giving full control over styling, behavior, and animations without rigid npm library constraints.
- **Radix UI / Headless Primitives:** Accessibility, keyboard navigation, focus management, and ARIA attributes are handled at the primitive layer.
- **Tailwind Utility Styling:** Visual presentation is decoupled and styled via clean Tailwind classes.

## 2. Core Component Blueprints

### A. Dialog / Modal Pattern
- Backdrop overlay with smooth blur: `fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-xs`
- Modal dialog centered with Spring animation:
  ```jsx
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 10 }}
    className="relative w-full max-w-lg rounded-3xl border border-[#dcd2c3] bg-paper p-6 shadow-2xl"
  >
  ```
- Focus trap and Escape key listener to close smoothly.

### B. Segmented / Folder Tabs Pattern
- Outer container with `-mb-px` alignment to connect seamlessly to the card below.
- Active tab indicator using Motion `layoutId="activeTabIndicator"`:
  ```jsx
  {isActive && (
    <motion.span
      layoutId="tabUnderline"
      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-cinnabar rounded-full"
    />
  )}
  ```

### C. Button Variants System
Standardize buttons with explicit variants and sizes:
```jsx
// Variants:
// - default: 'bg-cinnabar text-paper hover:bg-[#852324] shadow-xs'
// - outline: 'border border-[#dcd2c3] bg-paper text-charcoal hover:border-cinnabar hover:text-cinnabar'
// - ghost: 'text-charcoal/80 hover:bg-[#ede5d8]/50 hover:text-charcoal'
// - destructive: 'bg-red-600 text-white hover:bg-red-700'
```
Always attach `cursor-pointer transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none`.

### D. Form Controls & Floating Labels
- Input fields with clean warm borders: `border border-[#dcd2c3] focus:border-cinnabar focus:ring-2 focus:ring-cinnabar/20 rounded-xl px-4 py-2.5 outline-none transition`.
- Clear error messages placed directly below inputs with high-contrast text and icon.

## 3. Tailwind CSS v4 Best Practices

- Use CSS theme variables for theme tokens:
  - `--color-paper: #fbf9f5`
  - `--color-charcoal: #292723`
  - `--color-cinnabar: #9e2a2b`
- Merge classes cleanly using utility helpers or template literals, avoiding conflicting padding or layout styles.


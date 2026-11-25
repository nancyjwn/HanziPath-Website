---
name: ui-ux-pro-max
description: >-
  Use this skill for professional UI/UX design intelligence, design system creation,
  color theory reasoning, typography pairings, layout hierarchies (Bento, Swiss, Minimalism), and micro-interactions.
---

# UI/UX Pro Max: Professional Design Intelligence & Systems

Inspired by `nextlevelbuilder/ui-ux-pro-max-skill`, this skill provides deep UI/UX design architecture, layout frameworks, color psychology, and micro-interaction engineering for web applications.

## 1. Design System Architecture

### The 60-30-10 Color Distribution Rule
- **60% Dominant Base:** Xuan Paper / Warm White (`#fbf9f5` / `#ffffff`) creating calm, readable visual real estate.
- **30% Secondary Structure:** Charcoal Ink & Warm Sand (`#292723`, `#ede5d8`, `#dcd2c3`) defining borders, cards, and secondary typography.
- **10% Intentional Accent:** Cinnabar Red (`#9e2a2b` / `#a83228`) reserved strictly for interactive actions, focus states, and primary call-to-actions.

### Typographic Hierarchy & Scale
- **Display / Hero:** 36px–56px, high contrast, serif or bold geometric, tight line-height (1.1–1.15).
- **H2 / Section Title:** 24px–36px, font-medium to font-bold, clear letter-spacing (-0.02em).
- **H3 / Card Header:** 18px–22px, font-semibold, comfortable line-height (1.3).
- **Body Text:** 14px–16px, relaxed line-height (1.6), high readability, muted contrast (`#555148` or `text-charcoal/80`).
- **Microcopy / Badges:** 11px–12px, font-mono or font-medium, tracked out (+0.05em to +0.1em) for crisp legibility.

## 2. Layout Archetypes & Spatial Rhythm

### Archetype A: Swiss Minimalism
- Asymmetrical balance where content weight counterbalances empty space.
- Stark, confident typographic statements without unnecessary illustrations or decorative filler.
- Clean 1px hairlines with subtle color tints instead of heavy box outlines.

### Archetype B: Bento Grid Modularity
- Multi-cell layouts where each cell has a distinct aspect ratio and purposeful role:
  - Hero cell (2x2 or 2x1) for primary feature or interactive demo.
  - Quick action cell (1x1) for bite-sized stats or shortcuts.
  - Spanning cell (3x1) for workflows or timelines.
- Soft rounded inner corners (`rounded-2xl` or `rounded-3xl`) with consistent interior gutters (`p-5 sm:p-6`).

### Archetype C: Seamless Folder Architecture
- Contiguous tab-to-card connections where active tabs blend seamlessly into the body container below using negative margins (`-mb-px`) and matched background fills.

## 3. Micro-Interactions & Tactile Engineering

- **Spring-Based Hover States:**
  ```javascript
  whileHover={{ y: -3, scale: 1.015 }}
  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
  ```
- **Active Click Feedback:**
  Buttons and interactive cards must include `active:scale-[0.98]` and `cursor-pointer` to provide reassuring tactile feedback.
- **Smooth Content Transitions:**
  Use `AnimatePresence mode="wait"` for tab switches and quiz steps so content enters smoothly without layout jumps.
- **Progressive Feedback:**
  - Success states: Celadon green borders (`#2e7d5b`) with subtle pulse animation.
  - Mistake / Retry states: Gentle horizontal shake animation (`keyframes: [-4, 4, -3, 3, 0]`) rather than aggressive red flashes.

## 4. UX Anti-Patterns to Avoid

- **No Trapped Layouts:** Never force horizontal scrolling on mobile; cards must wrap or adapt gracefully (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
- **No Orphan Labels:** Never place floating labels disconnected from their target inputs or cards.
- **No Dead Ends:** Every completed action (e.g. finishing a quiz, saving a word) must provide clear, obvious next steps (e.g., "Practice Flashcards", "Review Errors", "Return Home").


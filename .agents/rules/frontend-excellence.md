---
title: Frontend Excellence & Design System Guidelines
trigger: always_on
---

# Frontend Excellence & Design System Guidelines

This project adheres to the unified frontend standards established by:
- **`taste-skill`**: Anti-AI-slop, authentic Oriental scholar aesthetic, intentional art direction.
- **`ui-ux-pro-max`**: Design system architecture, 60-30-10 color rule, typographic hierarchy, micro-interactions.
- **`frontend-design`**: Boutique studio design lead mindset, grounding designs in real subject matter.
- **`shadcn-ui-craft`**: Composable, accessible component primitives, Tailwind CSS v4 tokenization.
- **`web-accessibility`**: W3C WCAG 2.2 AA standards, full keyboard operability, color contrast, semantic HTML.
- **`google-web-design`**: Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1), responsive fluidity, purposeful motion.
- **`transitions-dev`**: 60fps GPU-accelerated motion choreography, tactile spring physics, error shakes, reduced-motion accessibility.

## Core Rules for This Codebase:
1. **Design Tokens:**
   - Rice Paper Background: `#FBF9F5` / `#FAF6F0`
   - Charcoal Ink: `#292723` / `#1F1E1B`
   - Cinnabar Red: `#9E2A2B` / `#B83A30`
   - Warm Sand: `#EDE5D8` / `#DCD2C3`
   - Celadon Jade: `#2E7D5B`
2. **Typography:**
   - Headlines & Calligraphy: Classical serif (Noto Serif SC, Playfair, font-serif).
   - UI & Body: Clean, crisp neo-grotesque sans-serif (font-sans).
   - Pinyin & Badges: Clean font-mono or font-medium with tonal accents.
3. **Interactive Standards:**
   - All interactive elements must have `cursor-pointer transition-all duration-200 active:scale-[0.98]`.
   - Modals and tabs must use smooth Motion transitions (`AnimatePresence mode="wait"`).
   - All icon-only buttons must have `aria-label`.
4. **Layout Protection:**
   - Keep containers bounded with `overflow-hidden` where background decorations exist to prevent mobile horizontal scrollbars.
   - Decouple adjacent column heights during interactive states (e.g. quiz execution) so cards don't deform or create empty whitespace.


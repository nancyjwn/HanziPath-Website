---
name: frontend-design
description: >-
  Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one.
  Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.
---

# Frontend Design: The Design Studio Mindset

From the official Anthropic skills repository (`anthropics/skills/tree/main/skills/frontend-design`), this skill guides the agent to approach every frontend task as the lead designer of a boutique studio.

## 1. Approach as a Boutique Design Lead

Approach this project as the design lead at a specialized design studio known for giving every client a distinct visual identity that is never mistaken for anyone else's. The client has rejected cliché and templated proposals, paying for a distinctive point of view:
- Make deliberate, opinionated choices about palette, typography, and layout specific to this brief.
- Take aesthetic risks when justified by the subject matter.
- Avoid generic SaaS tropes: no predictable purple/cyan gradients, no standard card carousels with generic icons, and no cookie-cutter hero layouts.

## 2. Ground Your Designs in the Subject Matter

- **Root in Real Context:** Connect every visual decision to Chinese calligraphy, classical scholarship, Hanzi stroke structure, and modern language acquisition.
- **Authentic Cultural Vernacular:**
  - Tian Zi Ge (田字格) and Mi Zi Ge (米字格) character practice grids with crosshairs.
  - Cinnabar red seal stamps (*yìnzhāng*) for milestones and certifications.
  - Layered ink-wash (*shanshui*) mountain mist silhouettes and bamboo foliage.
  - Xuan paper textured background hues (`#FBF9F5` / `#FAF6F0`).
- **Real Content Always:** Never use `Lorem ipsum` or generic placeholder text. Use real HSK vocabulary, accurate Pinyin tone marks, concise example sentences, and authentic character stroke definitions.

## 3. The Two-Pass Planning Process

Before writing JSX/CSS:

### Pass 1: The Design Plan
Define:
1. **Color Tokens:** 4–6 specific hex codes with clear semantic assignments.
2. **Typography Roles:** Exactly which typeface carries display headlines vs. UI body vs. Chinese characters vs. Pinyin.
3. **Spatial Hierarchy:** The dominant focal element and how the eye travels across the viewport.

### Pass 2: The Self-Critique
Ask:
- *"Does this look like a generic Tailwind component or does it feel custom-crafted for this specific application?"*
- *"Are the interactive states tactile, smooth, and delightful?"*
- Adjust and polish before delivering the final code.

## 4. Microcopy and Content Discipline

- **Direct Action Verbs:** Use clear, purposeful action copy: `"Start the Challenge Now"`, `"Flip Card"`, `"Save to Notebook"`, `"Next Question"`.
- **Eliminate Clutter:** Remove wordy instructions and unnecessary badges. Let clean typography and visual cues guide the user naturally.
- **Friendly & Encouraging Feedback:** In quizzes and practice tests, provide educational explanations that highlight why an answer is correct rather than cold boolean alerts.


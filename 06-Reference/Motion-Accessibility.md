---
title: "Motion Accessibility — reduced motion & seizure-safe practice"
type: document
status: published
visibility: public
owner: Reid
created: 2026-08-19
updated: 2026-08-19
tags: [reference, accessibility, wcag, reduced-motion]
related: []
verify: false
---

# Motion Accessibility

Motion can injure. For people with vestibular disorders, parallax and zoom can
cause dizziness and nausea; for people with photosensitive epilepsy, flashing
can trigger seizures. Accessible motion isn't a nice-to-have in this course —
**it's graded** (Projects 2 and 4 require a reduced-motion story).

## The three WCAG anchors

- **2.2.2 Pause, Stop, Hide** — moving content that starts automatically, lasts more than 5 seconds, and sits alongside other content needs a way to pause, stop, or hide it.
- **2.3.1 Three Flashes or Below Threshold** — nothing flashes more than three times per second (above threshold). This is the seizure-safety line; treat it as absolute.
- **2.3.3 Animation from Interactions (AAA)** — motion triggered by interaction can be disabled unless the animation is essential to the function.

## `prefers-reduced-motion`

Every modern OS has a "reduce motion" setting; the web sees it as a media query:

```css
@media (prefers-reduced-motion: reduce) {
  .fancy { animation: none; transition: none; }
}
```

For Lottie/Rive, check the same preference in JavaScript
(`matchMedia('(prefers-reduced-motion: reduce)')`) and swap behavior.

**Reduced ≠ removed.** The goal is to preserve the *meaning* with less
movement: a cross-fade instead of a slide, a static success state instead of a
confetti burst, an instant appearance instead of a zoom. Decide what the
animation communicates, then communicate it more calmly.

## The checklist (applied to every project)

1. Nothing flashes >3×/second. Ever.
2. Autoplaying motion >5s has pause/stop/hide.
3. A `prefers-reduced-motion` alternative exists and preserves meaning.
4. No large-area parallax/zoom/spin tied to scroll without an opt-out.
5. Motion isn't the *only* carrier of critical information.
6. You've watched your piece with Reduce Motion ON (make this a Week-1 habit).

**Deeper reading:** resources tagged `accessibility` in [[Learning-Resources]].

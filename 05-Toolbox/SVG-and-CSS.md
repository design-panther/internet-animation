---
title: "SVG & CSS — web-native motion"
type: document
status: published
visibility: public
owner: Reid
created: 2026-08-19
updated: 2026-08-19
tags: [toolbox, svg, css, web-native, unit-3]
related: []
verify: false
---

# SVG & CSS — motion with no runtime

The web can animate itself: SVG provides resolution-independent vector
structure in markup, and CSS transitions/animations (plus the Web Animations
API) move it — no player library, no exported file, nothing to download but
the page. This course covers it at survey level in Week 12.

## The survey

- **SVG structure** — shapes, paths, groups, `viewBox`; an SVG is a DOM you can style and animate element by element.
- **CSS transitions** — animate between two states on a trigger (hover, class change). Most microinteractions need nothing more.
- **CSS animations** — `@keyframes` for multi-step, looping, or autonomous motion.
- **Web Animations API** — the same engine from JavaScript, when you need dynamic values or playback control.
- **`prefers-reduced-motion`** — the media query where your reduced-motion fallback lives ([[Motion-Accessibility]]); it's *easier* here than anywhere else in the course.

## When web-native wins

- The motion is simple, structural, or state-driven (hovers, reveals, loaders).
- Performance and weight matter — a few lines of CSS beat any runtime.
- You need the animation to inherit CSS variables/theming from the page.

Trade-off: no timeline editor. Complex choreography gets painful fast — which
is exactly the judgment call the [[Platform-Comparison]] matrix trains.

## Where it appears

Week 12 (survey + recreating one of your Lottie microinteractions in pure
CSS), and as a legitimate platform choice for the final project.

**Tutorials:** see [[Learning-Resources]] tagged `week-12`.

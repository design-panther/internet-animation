---
title: "After Effects & Bodymovin — the Lottie pipeline"
type: document
status: published
visibility: public
owner: Reid
created: 2026-08-19
updated: 2026-08-19
tags: [toolbox, after-effects, bodymovin, lottie, unit-2]
related: []
verify: false
---

# After Effects & Bodymovin — the industry pipeline

After Effects is the industry's vector-animation workhorse; **Bodymovin** (the
LottieFiles plugin) is the exporter that turns an AE composition into a
Lottie/dotLottie file. AE is on the ET 206 lab machines; Bodymovin is a free
plugin (installed via the LottieFiles plugin or aescripts).

## The parts of AE this course uses

- **Shape layers** — vector objects native to AE; the backbone of Lottie-compatible work.
- **Transform properties** — position, scale, rotation, opacity, anchor point: the five verbs of UI motion.
- **The graph editor** — where easing actually lives. If you only keyframe with "easy ease," you're not driving yet.

## Keeping files Lottie-compatible

Rules of thumb (the full supported-features list is in [[Learning-Resources]]):

- Shape layers: yes. Solids, nulls, precomps: mostly. **Layer effects, most plugins, blending quirks: no.**
- Expressions: some survive (Bodymovin can bake them), but simpler is safer.
- Raster footage travels as embedded images — it works, but you lose the "tiny vector file" advantage.
- **Export early, export often.** Don't build for a week and discover on Friday that your gradient trick doesn't export.

## Where it appears

Weeks 5–8 (Unit 2), then whenever you choose the Lottie pipeline for Projects
3–4. Exercise 2 is a supported-vs-unsupported scavenger hunt in miniature.

**Tutorials:** see [[Learning-Resources]] tagged `week-05` / `week-06`.

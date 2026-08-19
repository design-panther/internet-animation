---
title: "Illustrator & Figma — vector drawing"
type: document
status: published
visibility: public
owner: Reid
created: 2026-08-19
updated: 2026-08-19
tags: [toolbox, illustrator, figma, unit-1]
related: []
verify: false
---

# Illustrator & Figma — drawing animation-ready artwork

Where every animation in this course starts: clean vector artwork. Illustrator
is on the lab machines; Figma's education plan is free and runs in the browser
— use whichever you'll actually open, but learn to read both.

## What "animation-ready" means

- **Named layers.** `blob copy 4` will haunt you in After Effects. Name things for what they do: `arm-left`, `badge-ring`, `spinner-track`.
- **One object per thing that moves.** If the wing flaps separately from the body, the wing is its own layer/group.
- **Groups mirror the motion hierarchy.** Things that move together live together.
- **Paths, not effects.** Expanded, editable paths survive the trip to AE/Lottie; raster effects and fancy brushes don't.
- **Consistent artboard/frame size** across a set — your Project 1 assets should share one coordinate world.

## Handoff paths

- **Illustrator → After Effects:** import as composition, layers arrive as AE layers; convert to shape layers for Lottie work.
- **Figma → animation tools:** export SVG (flatten what shouldn't stay live), or copy-as-SVG per element. Rive imports SVG directly.

## Where it appears

Week 2 (foundations), then every project — Project 1's asset kit is graded
partly on layer hygiene.

**Tutorials:** see [[Learning-Resources]] tagged `week-02`.

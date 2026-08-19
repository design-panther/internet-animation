---
title: "Platform Comparison — Lottie vs. Rive vs. CSS/SVG vs. GIF/video"
type: document
status: published
visibility: public
owner: Reid
created: 2026-08-19
updated: 2026-08-19
tags: [reference, platforms, unit-3, week-12]
related: []
verify: false
---

# Platform Comparison

The Week-12 matrix, and the tool for every "what should I build this in?"
decision — including your final-project proposal. There is no best platform;
there is a best platform *for a brief*.

## The matrix

| | **Lottie/dotLottie** | **Rive** | **CSS/SVG (web-native)** | **GIF / video** |
|---|---|---|---|---|
| **Authoring** | After Effects (+Bodymovin), Lottie Creator | Rive editor | Code (or export from tools) | Anything |
| **File size** | Tiny (KB, vector) | Tiny (KB, binary vector) | Tiniest (it's markup) | Huge (MB, raster) |
| **Scales crisply** | ✅ | ✅ | ✅ | ❌ |
| **Interactivity** | Limited (play/pause/segments via JS) | ★ Built in (state machines, inputs, listeners) | Good (states via CSS/JS) | None |
| **Runtime needed** | Player library | Runtime library | ❌ None | ❌ None |
| **Design-tool friendly** | ★ Industry pipeline | Good (own editor, SVG import) | Weak (hand-off gap) | Trivial |
| **Complex choreography** | ★ (all of AE) | Good | Painful past medium complexity | ★ (it's video) |
| **Accessibility control** | Good (player API + reduced-motion via code) | Good (via code) | ★ Best (`prefers-reduced-motion` native) | Poor (autoplaying pixels) |
| **Theming/recoloring at runtime** | Some (players expose layers) | Good (inputs, data binding) | ★ (CSS variables) | ❌ |
| **Where it wins** | Brand animation, illustrated microinteractions, cross-platform delivery | Anything that must *respond*: characters, game-feel UI, live widgets | Structural UI motion: hovers, reveals, loaders, transitions | Email, legacy contexts, photographic motion |

## Rules of thumb

1. **Does it respond to the user beyond play/pause?** → Rive.
2. **Is it illustrated brand/character motion that plays?** → Lottie.
3. **Is it the interface itself moving (hover, open, load)?** → CSS/SVG.
4. **Is it photographic, or for email?** → video/GIF.
5. **Still tied?** → pick the cheapest to maintain — usually web-native, then Lottie.

## Cost dimension

All four are free-to-author in this course (school AE license, free tiers,
the open web). In industry, count: tool licenses, engineering time to integrate
runtimes, and the maintenance cost of each format in your codebase.

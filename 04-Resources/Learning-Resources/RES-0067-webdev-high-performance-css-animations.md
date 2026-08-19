---
id: RES-0067
title: "How to Create High-Performance CSS Animations (web.dev)"
type: resource
resource_type: article
creator: Kayce Basques and Rachel Andrew / web.dev
url: https://web.dev/articles/animations-guide
level: intermediate
format: article
cost: free
quality: 5
quality_notes: "Authoritative Google web.dev guide on GPU-friendly CSS animation; essential performance vocabulary for Week 12."
status: published
visibility: public
unit: 3
weeks: [12]
tags: [unit-3, week-12, css, animation-performance, web-animation]
related: []
verify: false
created: 2026-08-19
updated: 2026-08-19
---

# How to Create High-Performance CSS Animations (web.dev) — `RES-0067`

| Field | Value |
|---|---|
| Type | Article |
| Creator | Kayce Basques and Rachel Andrew / web.dev |
| Link | https://web.dev/articles/animations-guide |
| Level | Intermediate |
| Length / format | Article with DevTools walkthrough |
| Cost | free |

## What it covers
A web.dev guide explaining why performant CSS animations should stick to `transform` and `opacity` (properties the browser can composite on the GPU without triggering layout/paint), with practical techniques like `translate`/`scale` for movement/resizing and `will-change` for optimization hints, plus how to debug dropped frames in browser DevTools.

## What you'll learn
- Why `transform` and `opacity` are the "safe" properties to animate
- What layout, paint, and composite mean and why they matter for frame rate
- How to use `will-change` correctly (and when it backfires)
- How to spot dropped frames and repaint issues using DevTools

## Notes
Core Week 12 reading for comparing CSS/SVG animation to Lottie/Rive on performance — gives students the technical vocabulary to explain WHY one platform choice might run smoother than another on lower-end devices.

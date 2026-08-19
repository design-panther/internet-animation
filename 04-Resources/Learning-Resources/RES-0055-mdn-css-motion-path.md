---
id: RES-0055
title: "CSS Motion Path Guide (MDN Web Docs)"
type: resource
resource_type: doc
creator: Mozilla Contributors (MDN)
url: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Motion_path
level: intermediate
format: official documentation
cost: free
quality: 5
quality_notes: "Canonical MDN reference for the CSS Motion Path module; essential Week 10 reading."
status: published
visibility: public
unit: 3
weeks: [10]
tags: [unit-3, week-10, motion-path, css, bezier, offset-path]
related: []
verify: false
created: 2026-08-19
updated: 2026-08-19
---

# CSS Motion Path Guide (MDN Web Docs) — `RES-0055`

| Field | Value |
|---|---|
| Type | Documentation |
| Creator | Mozilla Contributors (MDN) |
| Link | https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Motion_path |
| Level | Intermediate |
| Length / format | Reference guide with live example |
| Cost | free |

## What it covers
MDN's official reference for the CSS Motion Path module: `offset-path`, `offset-distance`, `offset-rotate`, `offset-anchor`, `offset-position`, and the `offset` shorthand. It includes a working demo animating a box along a heart-shaped SVG `path()` by tweening `offset-distance` from 0% to 100%, and cross-links to related CSS Shapes, Transforms, and Masking modules.

## What you'll learn
- How to define a custom path (including bezier-curve SVG path data) with `offset-path`
- How `offset-distance` moves an element along that path over time
- How `offset-rotate` orients an element to follow the path's direction, useful for orbit-style motion
- How motion-path techniques differ from simple `transform: translate()` animation
- Current browser support for the feature (baseline since 2022)

## Notes
Core reference for Week 10's motion-path topic (bezier, arc, orbit, spiral, wave paths); pair with `RES-0060` for worked path-shape examples beyond the single demo shown here.

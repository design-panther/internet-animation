---
id: RES-0060
title: "Fun With CSS Motion Path (Michelle Barker, CSS { In Real Life })"
type: resource
resource_type: article
creator: Michelle Barker
url: https://css-irl.info/fun-with-css-motion-path/
level: intermediate
format: tutorial article with live CodePen demos
cost: free
quality: 3
quality_notes: "Good creative worked example but from 2020 and uses pre-rename property syntax; narrower/dated vs. RES-0055."
status: published
visibility: internal
unit: 3
weeks: [10]
tags: [unit-3, week-10, motion-path, spiral, svg, css]
related: []
verify: false
created: 2026-08-19
updated: 2026-08-19
---

# Fun With CSS Motion Path (Michelle Barker, CSS { In Real Life }) — `RES-0060`

| Field | Value |
|---|---|
| Type | Article |
| Creator | Michelle Barker |
| Link | https://css-irl.info/fun-with-css-motion-path/ |
| Level | Intermediate |
| Length / format | Tutorial article with live CodePen demos, published January 6, 2020 |
| Cost | free |

## What it covers
A hands-on, example-driven walkthrough of the CSS Motion Path spec (`offset-path`, `offset-distance`) built around a spiral SVG path, going beyond the bare API reference into a worked creative example. Barker also shows how to combine motion-path animation with SVG stroke techniques (`stroke-dasharray`/`stroke-dashoffset`) to "draw" a path and add a trailing motion-blur effect using `box-shadow`, and notes browser-support caveats at time of writing (Chrome native, Firefox behind a flag until v72).

## What you'll learn
- How to animate an element along a custom spiral/curved path defined in SVG path syntax
- How to combine `offset-path` with stroke-drawing techniques for a "path reveal" effect
- A creative technique for faking motion blur along a path with layered `box-shadow`
- A worked, non-trivial example beyond the simple demos in the MDN reference (`RES-0055`)

## Notes
Complements Week 10's motion-path topic (arc/spiral/wave shapes) with a concrete creative build; some CSS syntax details predate current spec naming (article uses `motion-path`/`motion-offset` in a few spots, since renamed to `offset-path`/`offset-distance`), so cross-check property names against `RES-0055` when following along.

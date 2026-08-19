---
id: RES-0057
title: "mix-blend-mode CSS Property (MDN Web Docs)"
type: resource
resource_type: doc
creator: Mozilla Contributors (MDN)
url: https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode
level: intermediate
format: official documentation
cost: free
quality: 5
quality_notes: "Canonical MDN reference for mix-blend-mode; essential compositing resource for Week 10."
status: published
visibility: public
unit: 3
weeks: [10]
tags: [unit-3, week-10, blend-modes, css, compositing]
related: []
verify: false
created: 2026-08-19
updated: 2026-08-19
---

# mix-blend-mode CSS Property (MDN Web Docs) — `RES-0057`

| Field | Value |
|---|---|
| Type | Documentation |
| Creator | Mozilla Contributors (MDN) |
| Link | https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode |
| Level | Intermediate |
| Length / format | Reference guide with interactive examples |
| Cost | free |

## What it covers
MDN's reference for the `mix-blend-mode` property, which controls how an element blends with whatever renders behind it. It documents all standard blend modes (`multiply`, `screen`, `overlay`, `darken`, `lighten`, `color-dodge`, `color-burn`, `hard-light`, `soft-light`, `difference`, `exclusion`, `hue`, `saturation`, `color`, `luminosity`, plus `plus-darker`/`plus-lighter`), notes that the property is a Baseline (widely available) feature since January 2020, and distinguishes it from the related `background-blend-mode` property.

## What you'll learn
- The difference between `mix-blend-mode` (blends an element with content behind it) and `background-blend-mode` (blends backgrounds within one element)
- What each named blend mode visually does (darken vs. lighten families, contrast modes, component modes)
- That applying a blend mode creates a new stacking context, which can affect layout/z-index behavior
- How to combine blend modes with moving/animated elements for compositing effects in motion work

## Notes
Reference for Week 10's blend-modes topic; best used alongside a live CodePen-style sandbox so students can see each mode applied to overlapping animated shapes.

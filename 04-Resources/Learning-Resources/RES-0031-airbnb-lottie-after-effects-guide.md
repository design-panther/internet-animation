---
id: RES-0031
title: "After Effects Guide for Lottie/Bodymovin (airbnb/lottie GitHub)"
type: resource
resource_type: doc
creator: Airbnb (Lottie project)
url: https://github.com/airbnb/lottie/blob/master/after-effects.md
level: beginner
format: official docs (GitHub)
cost: free
quality: 5
quality_notes: "Cached content confirms match to description despite a GitHub render error on fetch; the Lottie project's own AE export guidance — essential, highly specific."
status: published
visibility: public
unit: 2
weeks: [5, 6]
tags: [unit-2, week-5, week-6, after-effects, lottie, bodymovin, workflow]
related: [RES-0034]
verify: false
created: 2026-08-19
updated: 2026-08-19
---

# After Effects Guide for Lottie/Bodymovin (airbnb/lottie GitHub) — `RES-0031`

| Field | Value |
|---|---|
| Type | doc |
| Creator | Airbnb (Lottie project) |
| Link | https://github.com/airbnb/lottie/blob/master/after-effects.md |
| Level | beginner |
| Length / format | official docs (GitHub) |
| Cost | free |

## What it covers
The Lottie project's own guidance (in the airbnb/lottie repository) on preparing an After Effects file for a clean Bodymovin/Lottie export: keeping compositions simple for compact JSON, converting vector assets to shape layers, exporting at 1x resolution, and a list of unsupported features (expressions, most Effects-menu effects, blending modes, layer styles, luma mattes) with troubleshooting steps and a full workflow through testing in the LottieFiles preview app.

## What you'll learn
- Concrete AE workflow habits that keep a file Lottie-compatible (simplify compositions, convert to shape layers, avoid raster/1x export pitfalls)
- Which After Effects features Lottie explicitly does not support and why they should be avoided from the start
- A full pipeline view: design in AE → export with Bodymovin → test in the LottieFiles preview app
- How to troubleshoot a broken or oversized export before it ships

## Notes
Directly supports the Week 5 "AE workflow habits that keep files Lottie-compatible" objective and bridges into Week 6's Lottie/Bodymovin material — assign this as the transition reading between the two weeks.

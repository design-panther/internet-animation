---
id: RES-0058
title: "Springs and Bounces in Native CSS (Josh W. Comeau)"
type: resource
resource_type: article
creator: Josh W. Comeau
url: https://www.joshwcomeau.com/animation/linear-timing-function/
level: intermediate
format: illustrated article with interactive demos
cost: free
quality: 5
quality_notes: "Excellent in-depth, honest treatment of CSS linear() springs from a highly respected front-end educator."
status: published
visibility: public
unit: 3
weeks: [10]
tags: [unit-3, week-10, bounce, spring, easing, css]
related: []
verify: false
created: 2026-08-19
updated: 2026-08-19
---

# Springs and Bounces in Native CSS (Josh W. Comeau) — `RES-0058`

| Field | Value |
|---|---|
| Type | Article |
| Creator | Josh W. Comeau |
| Link | https://www.joshwcomeau.com/animation/linear-timing-function/ |
| Level | Intermediate |
| Length / format | Long-form illustrated article with interactive demos |
| Cost | free |

## What it covers
An in-depth, hands-on explanation of how the CSS `linear()` timing function lets you build spring and bounce motion natively, without a JavaScript animation library. Comeau shows that `linear()` connects many discrete points with straight segments rather than a smooth curve, explains why natural-feeling springs need 40+ points, and points to generator tools (Linear() Easing Generator, Easing Wizard) that produce the values automatically. He's honest about the tradeoffs: these are time-based (not physics-based) approximations, interruptions can look unnatural, and large point sets add a small amount of CSS bundle weight (~1.3kB per spring in his example).

## What you'll learn
- How to produce a believable spring/bounce effect using only CSS, no JS library
- Why a bounce curve needs many more control points than a simple bezier ease
- The practical difference between a time-based bounce approximation and a true physics-based spring
- Where to find free tools that generate `linear()` easing values for you
- Honest tradeoffs (performance, interruptibility) to weigh before choosing this technique

## Notes
Supports Week 10's "bounce" motion-path/easing topic; assumes basic CSS animation knowledge, so pair with `RES-0056` if students need a bezier-easing refresher first.

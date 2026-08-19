---
id: RES-0065
title: "Using the Web Animations API (MDN)"
type: resource
resource_type: doc
creator: MDN Web Docs
url: https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API
level: intermediate
format: official documentation
cost: free
quality: 5
quality_notes: "Canonical MDN guide to the Web Animations API; essential Week 12 reference."
status: published
visibility: public
unit: 3
weeks: [12]
tags: [unit-3, week-12, web-animations-api, javascript, css]
related: []
verify: false
created: 2026-08-19
updated: 2026-08-19
---

# Using the Web Animations API (MDN) — `RES-0065`

| Field | Value |
|---|---|
| Type | Documentation |
| Creator | MDN Web Docs |
| Link | https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API |
| Level | Intermediate |
| Length / format | Official guide with worked examples |
| Cost | free |

## What it covers
MDN's guide to the Web Animations API (WAAPI), which lets JavaScript construct and control animations the same way CSS Animations/Transitions work under the hood. It walks through `Element.animate()` with keyframe objects, playback controls (`play`, `pause`, `reverse`, `updatePlaybackRate`), persisting final styles with `commitStyles()`, and reading animation state, using interactive Alice in Wonderland-themed examples.

## What you'll learn
- How to write a JS animation with `element.animate(keyframes, options)`
- How WAAPI relates to and extends CSS Animations/Transitions
- How to control playback (play/pause/reverse/rate) in response to user interaction
- How to read animation timing (`currentTime`) and respond to completion events/promises

## Notes
Core Week 12 reading for the "Web Animations API (survey level)" topic — gives students the JavaScript-driven alternative to pure CSS animation, useful when comparing platform capabilities (CSS/SVG vs. Lottie vs. Rive).

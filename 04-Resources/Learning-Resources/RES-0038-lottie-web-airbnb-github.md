---
id: RES-0038
title: "lottie-web (Airbnb) — GitHub Repository"
type: resource
resource_type: tool
creator: Airbnb
url: https://github.com/airbnb/lottie-web
level: beginner
format: GitHub repo / README + docs
cost: free
quality: 5
quality_notes: "Official Airbnb repo, the foundational Lottie web library still widely used and referenced."
status: published
visibility: public
unit: 2
weeks: [7]
tags: [unit-2, week-7, lottie, implementation, library, after-effects]
related: [RES-0037]
verify: false
created: 2026-08-19
updated: 2026-08-19
---

# lottie-web (Airbnb) — GitHub Repository — `RES-0038`

| Field | Value |
|---|---|
| Type | Library / tool (open source) |
| Creator | Airbnb |
| Link | https://github.com/airbnb/lottie-web |
| Level | Beginner |
| Length / format | README + linked docs |
| Cost | free |

## What it covers
The original open-source library that parses After Effects animations exported as JSON via the Bodymovin plugin and renders them natively on Web, Android, iOS, React Native, and Windows. The README explains the `lottie.loadAnimation()` API, the three available renderers (SVG, Canvas, HTML), supported AE features (shapes, masks, precomps, text, time remapping), and playback methods (play, pause, stop, setSpeed, segments).

## What you'll learn
- The end-to-end pipeline: After Effects + Bodymovin export → JSON → `lottie-web` render
- How to choose between SVG, Canvas, and HTML renderers and why it matters for performance
- Which After Effects features are safe to use for reliable, lightweight web output
- Core JavaScript API for embedding and controlling an animation on a page

## Notes
Supports Week 7's "implementing Lottie on the web" topic as the historical/foundational library that dotLottie (RES-0037) builds on and optimizes. Still widely used and referenced in tutorials, so students should recognize both names.

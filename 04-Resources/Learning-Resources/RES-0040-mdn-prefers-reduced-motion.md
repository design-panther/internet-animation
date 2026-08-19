---
id: RES-0040
title: "prefers-reduced-motion (MDN Web Docs)"
type: resource
resource_type: doc
creator: MDN Contributors
url: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
level: beginner
format: Reference documentation
cost: free
quality: 5
quality_notes: "Canonical MDN reference for prefers-reduced-motion; essential accessibility resource."
status: published
visibility: public
unit: 2
weeks: [7]
tags: [unit-2, week-7, accessibility, reduced-motion, css]
related: [RES-0041, RES-0042, RES-0043, RES-0044]
verify: false
created: 2026-08-19
updated: 2026-08-19
---

# prefers-reduced-motion (MDN Web Docs) — `RES-0040`

| Field | Value |
|---|---|
| Type | Reference documentation |
| Creator | MDN Contributors |
| Link | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion |
| Level | Beginner |
| Length / format | Reference page with code example |
| Cost | free |

## What it covers
The canonical reference for the `prefers-reduced-motion` CSS media feature, which detects whether a user has enabled a "reduce motion" OS-level setting so developers can minimize non-essential animation for people who experience discomfort from motion. It documents the `no-preference`/`reduce` values, lists how to enable the setting on Windows, macOS, iOS, Android, Linux, and Firefox, and gives a working CSS example that swaps a "pulse" scale animation for a gentler opacity "dissolve."

## What you'll learn
- The syntax and values of the `prefers-reduced-motion` media query
- How to test the setting yourself on your own OS before shipping
- A concrete pattern for swapping large-motion animations for subtler alternatives
- That this feature has been "Baseline widely available" since January 2020

## Notes
Core Week 7 accessibility reference. Should be read alongside the WCAG success criteria (RES-0041–0043) and the vestibular-disorders primer (RES-0044) to connect the CSS mechanism to the human reasons it exists.

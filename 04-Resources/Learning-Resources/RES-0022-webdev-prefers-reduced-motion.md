---
id: RES-0022
title: "prefers-reduced-motion: Sometimes Less Movement Is More (web.dev)"
type: resource
resource_type: article
creator: Thomas Steiner
url: https://web.dev/articles/prefers-reduced-motion
level: beginner
format: article with code examples
cost: free
quality: 5
quality_notes: "Loads free; rich working code examples matching description exactly — essential accessibility reference."
status: published
visibility: public
unit: 1
weeks: [4]
tags: [unit-1, week-4, accessibility, motion-sickness, vestibular, prefers-reduced-motion]
related: [RES-0019, RES-0023]
verify: false
created: 2026-08-19
updated: 2026-08-19
---

# prefers-reduced-motion: Sometimes Less Movement Is More (web.dev) — `RES-0022`

| Field | Value |
|---|---|
| Type | Article |
| Creator | Thomas Steiner |
| Link | https://web.dev/articles/prefers-reduced-motion |
| Level | Beginner |
| Length / format | article with code examples |
| Cost | free |

## What it covers
Explains the `prefers-reduced-motion` CSS media feature, which detects whether a user has told their operating system to minimize animation and motion. Covers why this matters as "a medical necessity" for users with vestibular disorders or motion sensitivity, and shows working CSS, JavaScript, and `<picture>`-element code for respecting the setting.

## What you'll learn
- What `prefers-reduced-motion` is and which browsers/OS settings support it
- How to write a CSS media query that disables or simplifies animation for users who've requested it
- How to detect and react to the setting changing live with JavaScript
- How to serve a static image instead of an animated GIF for users who prefer reduced motion

## Notes
Supports Week 4's "when motion hurts" topic (motion sickness, vestibular disorders). Pairs with RES-0023 (Val Head's A List Apart article) for the human/medical rationale and RES-0019 (Apple HIG) for platform-level design guidance on the same issue.

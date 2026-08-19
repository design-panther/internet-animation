---
id: RES-0043
title: "Understanding SC 2.3.3: Animation from Interactions (W3C WAI)"
type: resource
resource_type: doc
creator: W3C Web Accessibility Initiative (WAI)
url: https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html
level: intermediate
format: WCAG "Understanding" reference page
cost: free
quality: 5
quality_notes: "Authoritative W3C WAI standard completing the Week 7 three-part WCAG motion set."
status: published
visibility: public
unit: 2
weeks: [7]
tags: [unit-2, week-7, accessibility, wcag, vestibular-disorders, reduced-motion]
related: [RES-0040, RES-0041, RES-0042, RES-0044]
verify: false
created: 2026-08-19
updated: 2026-08-19
---

# Understanding SC 2.3.3: Animation from Interactions (W3C WAI) — `RES-0043`

| Field | Value |
|---|---|
| Type | Standards documentation |
| Creator | W3C Web Accessibility Initiative (WAI) |
| Link | https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html |
| Level | Intermediate |
| Length / format | Understanding-document page |
| Cost | free |

## What it covers
The official W3C explanation of WCAG Success Criterion 2.3.3 (Level AAA): motion animation triggered by user interaction (e.g., parallax on scroll, elements that fly/zoom/spin when clicked) must be able to be disabled, unless the animation is essential to functionality or the information conveyed. It explains that people with vestibular disorders can experience dizziness, nausea, and headaches from such interaction-triggered motion, and recommends both eliminating unnecessary motion and honoring the `prefers-reduced-motion` OS setting.

## What you'll learn
- The distinction between this AAA criterion and the "auto-playing" content covered by 2.2.2
- Why interaction-triggered motion (parallax, hover-zoom, scroll-linked animation) is a distinct accessibility risk
- How `prefers-reduced-motion` (RES-0040) is the recommended implementation mechanism for this criterion
- Which animations count as "essential" and are therefore exempt

## Notes
Completes Week 7's three-part WCAG motion set (2.2.2, 2.3.1, 2.3.3) alongside RES-0041 and RES-0042. Especially relevant for scroll-triggered and hover-triggered Lottie/CSS effects.

Informational only — not legal advice.

---
title: "Motion Brief Template"
type: document
status: published
visibility: public
owner: Reid
created: 2026-08-19
updated: 2026-08-19
tags: [reference, ucd, template]
related: []
verify: false
---

# The Motion Brief — one page, four questions

Used in Projects 1–4. If you can't fill this in, you're not ready to animate;
if you can, most animation decisions start making themselves. Keep it to one
page.

## The template

**1. Audience — who is this for?**
> A concrete persona in a concrete moment. Not "users" — *"a commuter checking
> the bus app one-handed on a moving train, glancing, not reading."*

**2. Purpose — what job does the motion do?**
> Pick the primary job and name it: **feedback** (you tapped, it worked) ·
> **orientation** (where did that panel come from / go?) · **status** (still
> loading, don't leave) · **delight** (brand personality at a safe moment) ·
> **attention** (look here, once, gently). If the honest answer is "looks
> cool," go back to question 1.

**3. Constraints — what can't it be?**
> Duration ceiling (most UI motion: 100–500ms), file-size budget, platform
> (see [[Platform-Comparison]]), brand voice, and the **reduced-motion
> alternative** ([[Motion-Accessibility]]) — decided now, not retrofitted.

**4. Success criteria — how will you know it worked?**
> Testable statements. *"In a 3-person test ([[Usability-Test-Kit]]), users
> describe the loading state as 'quick' or 'fine,' none as 'annoying'"* ·
> *"Viewers correctly say what the toggle did without being told"* ·
> *"File under 30KB; plays at 60fps on the lab machines."*

## Worked micro-example

> **Audience:** first-time plant-app user who just logged their first watering.
> **Purpose:** feedback + a small dose of delight — confirm the log landed and make day one feel rewarding.
> **Constraints:** ≤600ms, Lottie ≤25KB, brand greens only; reduced-motion = fade to the checkmark, no confetti.
> **Success:** testers say "it saved" unprompted; nobody asks "did that work?"; no one over 40 winces.

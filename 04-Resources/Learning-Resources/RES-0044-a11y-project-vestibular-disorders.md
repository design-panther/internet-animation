---
id: RES-0044
title: "Understanding Vestibular Disorders (The A11Y Project)"
type: resource
resource_type: article
creator: Dennis Gaebel / The A11Y Project
url: https://www.a11yproject.com/posts/understanding-vestibular-disorders/
level: beginner
format: Article
cost: free
quality: 4
quality_notes: "Solid, plain-language grounding for the WCAG criteria; reputable a11y publication, good discussion starter."
status: published
visibility: public
unit: 2
weeks: [7]
tags: [unit-2, week-7, accessibility, vestibular-disorders, reduced-motion]
related: [RES-0040, RES-0043]
verify: false
created: 2026-08-19
updated: 2026-08-19
---

# Understanding Vestibular Disorders (The A11Y Project) — `RES-0044`

| Field | Value |
|---|---|
| Type | Article |
| Creator | Dennis Gaebel, The A11Y Project |
| Link | https://www.a11yproject.com/posts/understanding-vestibular-disorders/ |
| Level | Beginner |
| Length / format | Short article |
| Cost | free |

## What it covers
A plain-language primer on vestibular disorders — the inner-ear conditions that affect balance and can cause ongoing dizziness, instability, and visual disturbance (the article notes up to 35% of US adults over 40 experience some form of vestibular dysfunction). It calls vestibular disorders a "hidden disability" and gives concrete, developer-facing guidance: avoid auto-playing animation, provide user control, and use `prefers-reduced-motion` to disable or shorten animations/transitions rather than relying on personal taste.

## What you'll learn
- What a vestibular disorder is and why it's often invisible to designers
- Why parallax, spinning, and large-scale motion effects are specifically risky
- A practical technique — setting animation/transition durations to near-zero instead of fully removing them — that preserves JS event hooks like `animationend` while still feeling "off"
- Why "reduce motion" is a medical necessity for some users, not a stylistic preference

## Notes
Grounds Week 7's technical accessibility criteria (RES-0040–0043) in the human condition they're designed to protect. Good discussion-starter before assigning students to audit their own animated work.

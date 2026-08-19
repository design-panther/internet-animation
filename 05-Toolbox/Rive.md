---
title: "Rive — interactive animation"
type: document
status: published
visibility: public
owner: Reid
created: 2026-08-19
updated: 2026-08-19
tags: [toolbox, rive, state-machines, unit-3]
related: []
verify: false
---

# Rive — motion that responds

Rive is an editor + runtime for **interactive** vector animation. Where a
Lottie file is a clip that plays, a Rive file is a **system that responds**: a
state machine listens to inputs (hover, click, values from the app) and blends
between animations. The free tier is enough for this course.

## The three ideas

1. **State machines** — a diagram of states (idle, hover, pressed, celebrating) and the transitions between them. You design the *logic* of the motion, not just the frames.
2. **Inputs** — booleans, numbers, and triggers the outside world flips: `isHovered`, `progress`, `fire!`.
3. **Listeners** — pointer events wired inside the file itself, so the animation reacts without app code.

## When Rive over Lottie

- The animation must **react** (cursor-following eyes, a button with real states, a character that responds).
- You want one file that *contains* its interaction logic instead of five clips and a pile of JavaScript.
- See [[Platform-Comparison]] for the full matrix.

## Where it appears

Week 9 (state machines), Project 3 (one of the two platform options), and
optionally the final project. **Sketch the state diagram on paper before you
open the editor** — it's the assignment's real deliverable.

**Tutorials:** see [[Learning-Resources]] tagged `week-09`.

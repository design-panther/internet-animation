---
title: Glossary
type: document
status: published
visibility: public
owner: Reid
created: 2026-08-19
updated: 2026-08-19
tags: [reference, glossary]
related: []
verify: false
---

# Glossary

**Anchor point** — the point an element scales and rotates around. Wrong anchor point, wrong motion — set it before you keyframe.

**Animatic** — a rough, timed sequence of storyboard frames; the cheapest way to test whether choreography reads before production.

**Anticipation** — a small counter-move before the main action (the crouch before the jump). In UI: a button compressing before it launches.

**Bezier path / curve** — a curve defined by control handles; the geometry behind both motion paths and easing curves.

**Bodymovin** — the After Effects extension that exports compositions as Lottie JSON.

**dotLottie (`.lottie`)** — the production wrapper for Lottie: zipped, smaller, can bundle multiple animations, themes, and assets.

**Easing** — the acceleration profile of a move. `ease-out` = fast start, gentle landing (most UI entrances); `ease-in` = gentle start, fast exit; `linear` = mechanical, rarely right for UI.

**Easing curve / graph editor** — the visual editor for easing; the x-axis is time, the y-axis is progress (or velocity).

**Follow-through** — parts keep moving after the main body stops (hair, tails, ripples). In UI: the subtle overshoot on a settling card.

**Frame rate (fps)** — frames per second. Lottie/Rive are resolution- and largely framerate-independent; choppiness is usually a performance problem, not an fps setting.

**Keyframe** — a stated value at a stated time; the animation system interpolates between keyframes using the easing you chose.

**Listener (Rive)** — a pointer-event hookup living inside the Rive file (e.g. "pointer enters this area → set `isHovered` true").

**Lottie** — a JSON-based vector animation format (originating at Airbnb) rendered natively on web/iOS/Android; exported from AE via Bodymovin.

**Microinteraction** — a small, single-purpose piece of interactive motion: a like button, a loader, a pull-to-refresh. Trigger → rules → feedback → loops.

**Motion brief** — the one-page statement of audience, purpose, and success criteria for a piece of motion ([[Motion-Brief-Template]]).

**Motion path** — the route an element travels (line, bezier, arc, orbit, spiral, wave, bounce), as distinct from how it's eased along that route.

**Persona** — a concrete sketch of the user your motion serves; what turns "looks cool" into "helps this person do that task."

**prefers-reduced-motion** — the OS-level setting (surfaced to the web as a CSS media query) users enable to reduce animation; your work must respect it ([[Motion-Accessibility]]).

**Rig / rigging** — building a controllable structure (bones, constraints) so artwork can be animated as a system rather than frame by frame.

**Shape layer (AE)** — After Effects' native vector layer type; the backbone of Lottie-compatible animation.

**State machine (Rive)** — the diagram of states and transitions that makes an animation respond to inputs instead of just playing.

**Storyboard** — drawn frames of the key moments of a sequence, in order; the design of choreography before production.

**Timing** — how long things take and when they start relative to each other; with easing, the core craft of UI motion (most UI moves live between 100–500ms).

**Twelve principles** — the classic Disney animation principles (squash & stretch, anticipation, staging, follow-through, etc.), translated in this course to interface motion.

**Vector** — artwork stored as math (paths, points) rather than pixels; infinitely scalable, tiny to ship, and the reason Lottie files are kilobytes not megabytes.

**Web Animations API (WAAPI)** — the browser's native JavaScript animation interface; CSS animation power with runtime control.

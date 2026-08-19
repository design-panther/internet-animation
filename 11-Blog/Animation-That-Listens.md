---
title: "Animation That Listens"
type: document
status: published
visibility: public
blog_order: 3
blog_kicker: "03 · Interactive"
blog_accent: "#34d399"
blog_summary: "A Lottie plays; a Rive file listens. Unit 3 is the jump from clips to systems — state machines, longer staged compositions, honest three-person user tests, and the web-native motion that needs no runtime at all."
description: "The Unit 3 essay — Rive state machines, Fancy Animation Studio, user testing, and SVG/CSS."
tags: [blog, unit-3]
related: []
verify: false
created: 2026-08-19
updated: 2026-08-19
---

# Animation That Listens

Somewhere inside Duolingo's app is a character named Lily, and when she picks up a video call, she doesn't just play back a pre-baked clip of "friendly greeting." She's assembled in real time — one of roughly 16 base animations blended live into dozens of distinct movements, so the same handful of assets can produce more than 60 unique-feeling neutral behaviors without an animator hand-drawing every combination. Engineers and animators traded the file back and forth in a recurring hand-off process the team nicknamed "Riv Deliv," and the whole thing stayed under a single megabyte despite all that responsiveness. That's [[RES-0053-rive-duolingo-case-study|the Duolingo case study]], and it's worth sitting with, because it's the cleanest real-world proof of the idea this unit is built around: the moment you need motion to *respond* instead of just *play*, you're not making a clip anymore. You're building a system.

Everything up to now in this course has been a clip. A Lottie file, however cleverly built, has a start and an end and plays through the middle in the order you animated it. Unit 3 breaks that assumption. Over four weeks you'll build animation that takes input — a click, a hover, a boolean flipping somewhere in your app's logic — and decides what to do about it. That's a different discipline than keyframing, and it starts before you ever open a tool.

## Draw the boxes before you touch the editor

[[Week-09]] opens with Rive, and the single most important habit it teaches has nothing to do with the software. A Rive animation is organized around a **state machine**: a small number of named **states** (idle, hover, pressed, success), **inputs** that come from outside the animation (a boolean, a number, a trigger fired by your code), and **listeners** — the rules that say "if this input changes this way, transition from this state to that one." [[RES-0050-rive-state-machines-docs|Rive's own runtime documentation]] frames this plainly: a state machine is the logic layer that controls interactive animation, sitting one step above the timeline animations you already know how to build. [[RES-0051-rive-state-machine-beginners-guide|Valerie Veteto's beginner's guide]] on the Rive blog walks the same idea from the editor side — states as boxes, transitions as arrows between them, inputs as the switches that trigger the arrows.

Here's the part students skip and shouldn't: sketch that diagram on paper *before* you open the Rive editor. Boxes for states, arrows for transitions, labels for the inputs that fire each arrow. It feels like a slow detour when you're itching to start animating, but a state machine you design on the fly in software is a state machine you'll spend twice as long debugging, because you're trying to hold the graph and the keyframes in your head at once. Separate the two problems. Solve the logic on paper, then go build the motion for each state knowing exactly what it needs to hand off to. This is also, not coincidentally, how the Duolingo team seems to have approached Lily — a defined set of states and a blending logic decided before the asset count exploded.

None of this makes Rive a strict upgrade over Lottie. [[RES-0052-rive-vs-lottie|Rive vs. Lottie]] is honest about the trade: Lottie's After Effects pipeline is still the deeper, more industry-standard authoring workflow for illustrated, plays-once brand motion, and it has broader design-tool support. Rive wins the moment your motion has to *know things* — the current toggle state, a live data value, which of several branches the user is in. If your Week 9 build is a hover-reactive icon or a two-state toggle, you're feeling that difference in miniature: same visual quality, wildly different relationship to the outside world. [[RES-0049-rive-getting-started|Rive's getting-started docs]] and [[RES-0054-awesome-rive|the awesome-rive resource list]] are where you go once your diagram is drawn and you need the specific button to click.

## Staging a scene, not a single move

[[Week-10]] pulls the lens back out. [[Fancy-Animation-Studio]] isn't asking you to build a responsive system — it's asking you to stage something longer and more choreographed than anything you've built so far, entirely in the browser, without opening After Effects. The week's technical focus is motion-path vocabulary: bezier, arc, orbit, spiral, wave, bounce. These aren't decorative flavor options. Each one implies a different relationship between an object and the space it moves through — a bezier path is authored and specific, an orbit path is inherently relational (something moving around something else), a spiral compresses distance and time in a way a straight bezier can't fake convincingly. [[RES-0055-mdn-css-motion-path|MDN's motion-path guide]] is useful here even outside Fancy Animation Studio, because the underlying geometric vocabulary — offset-path, offset-distance, offset-rotate — is the same idea implemented as web-native CSS, which is exactly where this unit is headed in Week 12.

The Week 10 assignment — recreate one motion path three ways and compare the feel — is the point, not busywork around the point. A path type isn't neutral. The same start and end points, moved along a bezier versus an arc versus a bounce, read as three different *intentions* to a viewer, even if the duration is identical. You're building the same instinct here that [[RES-0056-cubic-bezier-tool|Lea Verou's cubic-bezier editor]] and [[RES-0058-josh-comeau-springs-bounces|Josh Comeau's piece on native CSS springs and bounces]] are both trying to teach: easing and path shape are semantic choices, not settings you leave on default.

## Ask three people, then shut up and watch

By [[Week-11]] you have a piece — Rive or Fancy Animation Studio, doesn't matter which — built for [[Project-3-Interactive-Sequence]]. Now you have to find out if it actually works, and the method the course teaches is deliberately small: three users, twenty minutes, three test types, laid out in full in [[Usability-Test-Kit]].

The method matters more than the sample size suggests it should. [[RES-0062-why-test-with-5-users|Nielsen's classic research]] on small-sample testing is the reason this isn't a corner cut: a single test user surfaces roughly a third of a design's usability problems, and each additional user adds diminishing but real returns — which is why running several small tests across iterations beats one expensive big study. Three or five users won't *prove* your animation succeeds. It will reliably show you where it breaks. Say that distinction out loud to your test subjects and to yourself: **n=3 finds problems; it doesn't prove success.** Report findings as observations — "two of three hesitated before tapping" — never as statistics dressed up to sound more rigorous than they are. [[RES-0061-usability-testing-101|NN/g's usability testing primer]] and [[RES-0063-5-second-usability-test-video|their five-second test walkthrough]] are good short refreshers on running the session itself without leading the witness.

The kit's three tests target three different failure modes. **Comprehension** — show it once, ask "what just happened?" — catches motion that looks good but communicates nothing. **Preference**, A/B with a "why," catches the difference between what people notice and what they actually prefer, which are not the same thing. **Timing** — play it three times in a row and watch for the wince on the third — catches the animation that was charming once and is annoying by the third loop, which is nearly every animation a real user will actually encounter more than once. Do all three, write down what people say verbatim, and make exactly one revision the findings clearly demand. That one-page synthesis — what you tested, what you found, what you changed, what you deliberately didn't — is itself a graded piece of Project 3.

## The option that needs no runtime at all

[[Week-12]] closes the unit with the quietest, most durable option on the table: plain SVG and CSS. No player library, no runtime, no format lock-in — just markup and stylesheets the browser already knows how to run. [[RES-0066-mdn-svg-introduction|MDN's SVG introduction]] and [[RES-0067-webdev-high-performance-css-animations|web.dev's guide to high-performance CSS animation]] cover the mechanics; the deeper payoff is what web-native motion gives you for free that no other platform in this course does as cleanly: `prefers-reduced-motion`, a media query the browser exposes automatically so your animation can simply not run for someone who's told their OS they don't want it to. It's the accessibility control every other platform has to bolt on through code — here it's native.

That's the last row students fill in on the [[Platform-Comparison]] matrix, and it's the whole point of building it: there is no best platform, there's a best platform for a brief. Rive wins the moment something has to respond beyond play/pause. Lottie wins for illustrated brand motion moving through a design pipeline that already runs on After Effects. CSS/SVG wins for the interface itself moving — hovers, reveals, loaders — cheap to ship, native to the accessibility features you've been building toward since Unit 1. Video wins when the content is photographic or the destination is email. The Week 12 exercise — recreate one of your microinteractions in pure CSS and compare the effort against the Lottie version — is designed to make that trade-off land in your hands instead of on a slide.

## Where this points

Everything in this unit is rehearsal for one decision: your final project proposal, due at the end of Week 12. Persona, purpose, platform, scope — and by now "platform" isn't a guess, it's an argument you can actually defend, because you've built the same kind of motion two or three different ways and watched three real people react to at least one of them. That's the shift Unit 3 is really after. Not a new tool. A new question, asked automatically, before you open anything: what does this animation need to know, and who's going to tell me if it doesn't know it yet?

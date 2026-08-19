---
title: "Why Motion Needs a User"
type: document
status: published
visibility: public
blog_order: 1
blog_kicker: "01 · Foundations"
blog_accent: "#f59e0b"
blog_summary: "Flash died, vector animation scattered into Lottie and Rive, and the modern web settled the old argument: motion earns its place by serving someone. Unit 1, walked slowly."
description: "The Unit 1 essay — history, the 12 principles for UI, and the User-Centered Design turn."
tags: [blog, unit-1]
related: []
verify: false
created: 2026-08-19
updated: 2026-08-19
---

# Why Motion Needs a User

On January 12, 2021, Adobe flipped a switch and Flash Player stopped working — not slowly, not with a grace period, but by design. Adobe had built in a kill date, and browsers had already spent years stripping the plugin out of default installs. A technology that had once been the reason the web could move at all simply went dark. NPR covered it like an obituary, the kind of piece usually reserved for a person, and that was the right instinct: for about fifteen years, Flash *was* web animation, and its death is where this course's story actually starts. If you want the news-desk version of that ending, read [[RES-0001-rip-flash-player-npr|NPR's Flash obituary]]. If you want the view from inside the party, read [[RES-0002-short-history-of-flash-lawhead|Nathalie Lawhead's short history]] of the Flash website movement — an insider's account of a moment when personal sites were, as she puts it, an emerging art form, and when the decline had as much to do with platform politics (Apple never let Flash onto the iPhone) as with the security holes everyone remembers.

Both things were true. Flash was a mess of vulnerabilities that made browsers slower and less safe, and it was also the tool that let a generation of designers — with no coding background at all — put drawings in motion and ship them to millions of people. Losing it wasn't a clean win for "the open web." It was a real loss, softened by the fact that most of what made Flash worth mourning had already found somewhere else to live.

## Where the diaspora landed

Vector animation didn't die with Flash; it scattered. Two destinations matter most for this course. In 2017, Airbnb open-sourced **Lottie** — a way to export an After Effects animation as compact JSON and render it natively on iOS, Android, and the web, instead of baking it into a video file or a GIF. You'll spend all of Unit 2 in that pipeline, but it's worth knowing now that Lottie's whole premise is continuity with the Flash-era workflow: designers still animate in a familiar timeline tool, they just export to a format the modern web can actually parse. [[RES-0003-lottiefiles-developer-portal|LottieFiles' developer hub]] is the best map of how far that format has spread — into onboarding flows, loading states, app icons, even games — without a browser plugin in sight.

The second destination, **Rive**, goes further: instead of exporting a fixed timeline, it lets you build animations with real logic — state machines that respond to input, not just play back a recording. You'll meet Rive properly in Unit 3, but the shape of the story is the same. Both tools inherited Flash's core promise — vector art that's small, sharp at any size, and genuinely interactive — and rebuilt it on open standards instead of a proprietary plugin nobody controlled but Adobe.

That's the quiet argument this unit is trying to win you over on: the *medium* changed completely, but the reason to animate anything at all didn't. Motion on the modern web is small, vector, and — this is the part beginners skip — it has to justify its own existence every single time it plays. [[RES-0005-google-design-motion-meaningful|Google's Design team]] puts it almost as a warning: motion should clarify, not decorate. That's a much higher bar than "flashy," and it's the bar this whole course holds you to.

## The 12 principles, translated

Every animation textbook eventually gets to the twelve principles Disney animators Frank Thomas and Ollie Johnston wrote down decades ago — squash and stretch, anticipation, follow-through, timing, and so on. They were built for hand-drawn characters on film. They still work almost unchanged for a button.

Take anticipation: in a cartoon, a character crouches before it jumps. In an interface, that's the subtle scale-down on a button the instant before it's pressed — a signal, a beat before the real action. Follow-through is the reason a dismissed notification doesn't just vanish but eases past its resting point and settles, the way a thrown object doesn't stop dead. [[RES-0014-ixdf-disney-principles-ui|The IxDF's guide]] walks through this translation principle by principle, and it's the core reading for [[Week-03]] because it's the moment the twelve principles stop being animation history and start being a design vocabulary you can use to critique your own work — including your own [[Project-1-Animated-Asset-Kit|Project 1]].

Timing and easing deserve special attention, because they're where beginners most often go wrong. A linear ease — constant speed, no acceleration — reads as mechanical, even slightly wrong, because almost nothing in the physical world moves at a constant rate. [[RES-0017-nng-executing-ux-animations-duration|NN/g's research on animation duration]] gets specific about this in a way that's genuinely useful at the keyboard: simple feedback wants something like 100ms, a modal opening wants 200–300ms, and a large-scale transition can stretch toward 400ms — past that, users start to feel like the interface is stalling. The rule of thumb worth memorizing is that people notice a difference of even 50 milliseconds, and that when in doubt, you should cut the duration, not add to it. Pair that with [[RES-0016-easings-co-tool|Easings.co]] to actually feel what different cubic-bezier curves do to a moving object, and you have everything you need to defend every ease you use in [[Week-03]] — which is the assignment.

## The turn: motion needs a user

Here's where Unit 1 stops being a history lesson and becomes the spine of the whole semester. By [[Week-04]], the question changes from "how do I animate this?" to "who is this animation *for*, and how would I know if it worked?" That's User-Centered Design, and in this course it isn't an abstract methodology — it's a one-page document. Before you're allowed to call Project 1 finished, you write a [[Motion-Brief-Template|motion brief]]: who the audience is, what the motion is supposed to accomplish, and what "it worked" would look like.

[[RES-0024-nng-role-of-animation-motion-ux|NN/g's framework on the role of animation in UX]] gives you the language for the "helps" side of that brief — motion earns its place when it gives feedback on a system state, signals a change, clarifies hierarchy, or shows a user how something will behave before they commit to it. The "hurts" side is just as concrete, and it's not just an aesthetic complaint. [[RES-0022-webdev-prefers-reduced-motion|web.dev's write-up of the `prefers-reduced-motion` setting]] frames unrestrained motion as a genuine accessibility issue — for people with vestibular disorders, a spinning parallax hero isn't annoying, it's a trigger. Every animation you ship also costs someone's battery and someone's attention; "delight" doesn't excuse either one if the motion doesn't do a job.

That's the discipline [[Unit-1-Foundations]] is built to install before you touch a professional pipeline: draw it clean, animate it with easing you can defend, then write down — in one page — who it's for and why it moves at all. Flash let designers animate without asking that question, and for a long time nobody had to. The modern web, built out of what survived Flash's collapse, doesn't give you that luxury. It asks you to name your user first.

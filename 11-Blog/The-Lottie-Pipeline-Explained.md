---
title: "The Lottie Pipeline, Explained"
type: document
status: published
visibility: public
blog_order: 2
blog_kicker: "02 · The Pipeline"
blog_accent: "#60a5fa"
blog_summary: "From clean shape layers to a 20-kilobyte file that plays everywhere: the After Effects → Bodymovin → dotLottie pipeline end to end, including the export gotchas and the accessibility work that is part of the job."
description: "The Unit 2 essay — the Lottie/dotLottie pipeline from artwork to embed."
tags: [blog, unit-2]
related: []
verify: false
created: 2026-08-19
updated: 2026-08-19
---

# The Lottie Pipeline, Explained

Open a shopping app, tap "buy," and watch the little checkmark draw itself in a
loop of green. It takes maybe half a second. It's smooth at any screen size,
it doesn't pixelate when you're on a big tablet, and it weighs almost nothing
— probably under 20 kilobytes. Do the same trick with a GIF and you're looking
at two megabytes of blurry, banded color for a worse result. That gap — a
hundred times the file size for a worse-looking animation — is the entire
reason this unit exists.

The checkmark isn't a video. It isn't a GIF. It's a small JSON file that
describes vectors and keyframes, and it gets rendered live by the device it's
playing on. That file format is Lottie, and understanding how one gets made —
really made, from a blank After Effects composition to a working embed on a
web page — is the spine of the next four weeks.

## What Lottie actually is

A Lottie file is not a recording of an animation. It's a *description* of one
— shapes, paths, colors, and keyframed transform values, written out as JSON
— that a player on the receiving device reads and draws in real time, the
same way a browser reads HTML and draws a page. That's why a Lottie stays
crisp at any resolution (it's vector, so there's no upscaling artifact) and
why it can be so small (it's storing "rotate this circle from 0° to 360° over
12 frames," not twelve frames of pixels).

**dotLottie** is the newer, packaged version of the same idea: instead of a
bare `.json` file, a `.lottie` file is a compressed container that can bundle
multiple animations, their assets, themes, and even interactive state
machines into one file, the way a `.zip` bundles a folder. If Lottie is the
format, dotLottie is the production-ready shipping container for it — see
[[RES-0033-dotlottie-io-format-spec|the official dotLottie format spec]] for
the full pitch. For this course, you'll hear both names used almost
interchangeably; just know that `.lottie` is where the ecosystem is heading.

None of this is theoretical. It's the format behind loading spinners, "like"
button bursts, onboarding illustrations, and empty-state characters across
a huge share of the apps on your phone — see
[[RES-0003-lottiefiles-developer-portal|the LottieFiles developer hub]] for a
sense of just how much of the ecosystem runs on this one idea.

## The pipeline, start to finish

The path from an idea to a working embed has five real stages, and the whole
point of Unit 2 is to walk every one of them by hand at least once.

**1. Clean artwork.** It starts in illustration software with vector shapes
— not raster images, not scanned textures. If you bring flattened pixels
into this pipeline, you lose the "tiny file, infinite resolution" advantage
before you've animated a single frame.

**2. Shape layers in After Effects.** The artwork gets rebuilt (or imported
directly) as native AE shape layers — the vector objects After Effects
understands natively, as opposed to raster footage. This is the backbone of
everything downstream; see
[[RES-0025-ae-shape-layers-vector-overview|Adobe's own overview of shape
layers, paths, and vector graphics]] if Week 5 left any of it fuzzy.

**3. Graph editor easing.** This is where the animation stops looking like a
student project. "Easy ease" on every keyframe is a start, not a finish —
real timing lives in the graph editor, where you can see and reshape the
velocity curve directly.
[[RES-0026-ae-keyframe-interpolation-graph-editor|Adobe's keyframe
interpolation documentation]] and
[[RES-0027-school-of-motion-graph-editor-intro|School of Motion's graph
editor intro]] both walk through it if you need a second pass.

**4. Bodymovin export.** Bodymovin is the After Effects plugin — originally
built by Hernan Torrisi, later extended by Airbnb into the Lottie ecosystem —
that reads your AE composition and writes it out as Lottie JSON. This is also
where the pipeline gets honest with you — more on that below.
[[RES-0031-airbnb-lottie-after-effects-guide|The Lottie project's own AE
export guide]] is the single best document for this step; it's written by
the people who built the format.

**5. LottieFiles preview, then a dotLottie player embed.** Once exported, you
preview the file on LottieFiles — on the web and on a phone — before it ever
touches a real page. From there, embedding is small: the
[[RES-0037-dotlottie-js-player-docs|dotLottie JavaScript player]] drops the
animation into a page with a couple of lines of markup, no video tag, no GIF
hosting bill.

Five stages, and — this is the part beginners underestimate — every one of
them is a place things can quietly break.

## The gotcha: why effects vanish on export

Here's the thing nobody tells you the first time: After Effects can do far
more than Lottie can render. Layer effects, most of the Effects menu (blur,
distortion, glow), 3D layers, adjustment layers, complex expressions, blend
modes, time-stretching — all of it looks perfect in your AE preview and then
either disappears or breaks on export, because the Lottie/Bodymovin exporter
simply doesn't have a way to describe those things in JSON. You won't get a
loud error. You'll get a quiet, cosmetic hole where your effect used to be,
and if you don't catch it, that hole ships.

The fix isn't cleverness, it's a habit: **export early, export often.** Don't
build a polished 45-second composition for a week and find out on the Friday
deadline that your favorite gradient trick doesn't survive. Export after your
first ten keyframes. Export again after you add a stroke effect. Keep
[[RES-0034-lottiefiles-supported-ae-features|LottieFiles' supported-features
checklist]] open in a tab while you work, and treat it the way a print
designer treats a CMYK gamut warning — a constraint to design inside of, not
a surprise to discover at the deadline.

## Optimization and accessible motion aren't add-ons

Once a Lottie plays correctly, two more jobs remain, and both are graded in
this course, not optional polish.

**File size** still matters even in a format this efficient. Bloated paths,
unnecessary precomposing, and embedded raster images (which sneak the "heavy
GIF" problem back into a Lottie file) can turn a 20-kilobyte animation into a
2-megabyte one — quietly defeating the entire reason you chose this format.
Simplify your paths, avoid raster footage where a vector shape will do, and
check your file size before you call an export done.

**Accessible motion** is the other half of "done," and it's a design
decision, not a legal checkbox to tick after the fact. Some viewers get
genuinely dizzy or nauseated from parallax and zoom (vestibular disorders);
some can be triggered into a seizure by rapid flashing (photosensitive
epilepsy). The web gives you a real hook for this — the
`prefers-reduced-motion` media query, readable in CSS and in JavaScript via
`matchMedia`, described fully in
[[RES-0040-mdn-prefers-reduced-motion|MDN's prefers-reduced-motion
reference]] — plus three WCAG success criteria worth knowing by name:
[[RES-0041-wcag-2-2-2-pause-stop-hide|2.2.2 Pause, Stop, Hide]],
[[RES-0042-wcag-2-3-1-three-flashes|2.3.1 Three Flashes or Below
Threshold]], and [[RES-0043-wcag-2-3-3-animation-from-interactions|2.3.3
Animation from Interactions]]. Reduced motion doesn't mean *no* motion — it
means keeping the meaning of the animation while dialing down the
movement: a cross-fade instead of a slide, a static success state instead of
a confetti burst. The full reasoning, and the checklist you'll be graded
against, lives in [[Motion-Accessibility]].

## Where this lands

Read the [[Unit-2-The-Lottie-Pipeline|Unit 2 schedule page]] for the
week-by-week breakdown, and start small: in [[Week-06]] you'll run one
composition through the real pipeline and name, in three honest sentences,
what survived export and what didn't. That drill is deliberately a miniature
of the whole unit — you can't shortcut your way past the supported-features
list, so you might as well meet it early.

Everything converges in [[Project-2-Microinteraction-Set]]: three to five
Lottie files, shipped as one coherent system, with a reduced-motion story
built in from the start. At the midterm critique, every piece in the room
gets asked the same question, and it's not "is it smooth" or "is it clever."
It's this: **does the motion serve the persona?** A beautifully eased loading
spinner that ignores `prefers-reduced-motion`, or that nobody asked for in
the first place, fails that question just as surely as a spinner that never
learned to ease. The pipeline in this unit — [[After-Effects-and-Bodymovin]]
and all — exists to get a *good idea* out of your head and onto a real
screen without losing it along the way. What you do with that reliability is
the actual assignment.

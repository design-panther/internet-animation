---
title: "Shipping Motion That Works"
type: document
status: published
visibility: public
blog_order: 4
blog_kicker: "04 · Final Project"
blog_accent: "#fb7185"
blog_summary: "The final project is not a file, it is a story: brief, storyboard, test, revision, optimization, package. How to take an animation all the way — and what the field you are graduating into looks like."
description: "The Unit 4 essay — the final project as a full UCD cycle, plus portfolio packaging and the field ahead."
tags: [blog, unit-4]
related: []
verify: false
created: 2026-08-19
updated: 2026-08-19
---

# Shipping Motion That Works

Picture a Week 14 testing table. A student has spent six hours in the Lottie pipeline building a checkout confirmation — a satisfying little burst that turns a "Place Order" button into a checkmark. It looks great in isolation, looped on a laptop screen, exactly the way the After Effects preview promised it would. Then a classmate playing the role of a first-time user sits down, clicks the button once, and says: "Did that work? Did I just order it twice?" The animation is beautiful and it is broken, and the only reason anyone found out before the grade was due is that someone unfamiliar with the file watched it happen to a stranger.

That moment — not the render, not the export settings — is the actual center of [[Unit-4-Final-Project|Unit 4]]. The final project asks you to build a finished animation, yes. But the thing that's graded, the thing this whole course has been organizing toward since Week 1, is whether you can run a real design cycle on your own work: propose it, sketch it cheaply before you build it expensively, put it in front of someone who isn't you, change it because of what you learned, and then ship something a stranger could actually visit. That's the arc of [[Project-4-Final-Animation]], and it's worth taking each stage seriously on its own terms.

## The storyboard is the cheapest failure you'll ever have

By Week 13 your proposal is approved and it's tempting to treat the storyboard as a formality standing between you and the software. Resist that — the storyboard *is* the design work, not a chore that precedes it. [[Week-13]] exists specifically because the cost of discovering a bad idea on paper is minutes, and the cost of discovering it in a half-built After Effects comp is hours you don't get back. [[RES-0069-boords-storyboarding-motion-graphics|Boords' guide to storyboarding for motion graphics]] treats a storyboard like a script: it forces you to commit to what happens, in what order, at what pace, before a single vector path exists, and it walks through breaking a concept into beats and flagging timing right on the panel.

The animatic — a rough, timed version of the storyboard, even if it's just panels on a timeline with placeholder durations — is the same logic taken one step further. It's the cheapest possible failure: you can watch the *pacing* of an idea fail before you've drawn a single final frame. If the story doesn't read at animatic speed, no amount of easing-curve polish will save it later. Students who skip this step tend to discover its absence in Week 14, staring at a finished sequence that's technically well-crafted and somehow still confusing — which is a much more expensive place to learn the same lesson.

## Production meets a stranger's eyes

[[Week-14]] is where the piece actually gets built — and where, mid-production, you run the same test method from Week 11 on your own work: the [[Usability-Test-Kit]]. Three users, twenty minutes, and the discipline to write down what they say instead of what you wanted them to say. This is the point in the semester where the course's UCD spine stops being an abstraction and becomes a scheduling reality: you book the slot, you sit someone down, and you find out — the way that Week 14 student found out — what your animation actually communicates to someone who didn't build it and doesn't know what it's "supposed" to mean.

Run the comprehension test first. Show the piece once, ask what just happened, ask what they'd do next. If they can't answer, the motion isn't doing its job, no matter how much you love the overshoot on that bounce. The kit exists precisely because your own eyes are the least reliable instrument in the room by this point in production — you've watched the loop two hundred times, and you can no longer see it the way a first-time viewer does.

## Revision is a graded act, not a vibe

Here's where the rubric gets specific in a way that matters: [[Project-4-Final-Animation]] gives 10 of its 50 points to whether "the UCD process actually happened (brief, test, traceable revision)." That word — *traceable* — is doing real work. It is not enough to say "I tested it and made some changes." The synthesis format from the [[Usability-Test-Kit]] asks you to name the finding, name the one revision it most clearly demands, and defend anything you chose *not* to change. That last part matters as much as the first two. Not every observation from three users is a mandate — n=3 finds problems, it doesn't prove consensus — and being able to say "one user was confused by the timing, but I judged that noise because the other two read it correctly and the confused user was also on a laggy laptop" is itself evidence of design judgment, not evasion.

[[Week-15]] is where that revision gets built. Go back to the specific finding, make the specific change, and be ready to show both — the before and the after — at presentations. A vague "I polished it based on feedback" earns none of those ten points. "Two of three testers hesitated before the confirmation state; I extended it from 200ms to 450ms and added a distinct color shift" earns all of them.

## The optimization pass nobody skips anymore

Also in Week 15: the animation has to actually ship, which means it has to be fast and it has to respect people who've asked their devices to reduce motion. Neither is optional at this point in the course. [[RES-0067-webdev-high-performance-css-animations|web.dev's guide to high-performance CSS animation]] is the reference for keeping animations on the compositor thread instead of forcing layout recalculation on every frame — worth a re-read now that you're optimizing a real deliverable instead of a class exercise. Pair it with [[Motion-Accessibility]] and the `prefers-reduced-motion` guidance from Week 4 and Week 7: your final piece needs a genuine reduced-motion fallback, not a checkbox you forgot to test. If you built in Lottie or dotLottie, [[RES-0071-dotlottie-intro|dotLottie's production-format docs]] cover keeping file size sane without sacrificing fidelity — check your own export against it before you call the file "done."

File size numbers and a working fallback are graded evidence, per the rubric: 10 points for "technical delivery and optimization." Screenshot the before/after file size. Record the fallback actually engaging. Bring both to Week 16.

## Packaging: the process story is the real portfolio piece

Here's the reframe worth sitting with before presentations: the finished animation is not, by itself, your portfolio. School of Motion's [[RES-0070-school-of-motion-demo-reel-guide|guide to a killer demo reel]] makes the case that a reel is an argument for why someone should hire you, not an archive of everything you made. The same logic applies to a LottieFiles profile or a simple demo page: a stranger who lands on it should see the finished piece *and* understand, in a sentence or two, what problem it solved and for whom. That's the process story — brief, test, revision — shown, not just claimed. It's worth five points of the rubric on its own ("presentable to a stranger"), but its real value outlasts the grade: it's the artifact you'll actually point an employer to in six months, and "here's a checkout animation" is a much weaker pitch than "here's a checkout animation that tested confusing, and here's exactly what I changed and why."

## The field ahead

You're graduating into a moment where AI-assisted tools are genuinely useful for parts of a motion designer's job — generative fill, mocap pulled from ordinary video, faster voiceover drafts — and genuinely useless for the part this whole course has been teaching you: deciding what an animation should say, to whom, and whether it worked. [[RES-0072-ai-tools-for-motion-designers|School of Motion's rundown of AI tools that are actually helpful]] is worth reading precisely because it isn't a hype piece; it's a working motion designer's grounded read on where these tools save time and where they don't touch the actual craft. New runtimes will keep arriving too — you've already seen Lottie, dotLottie, and Rive's state machines this semester, and there will be more by the time you're a few years into a career. None of that changes the discipline underneath. Tools accelerate execution. They don't replace judgment, and judgment is what this course has actually been teaching.

## What "done" means

Not "the file renders." Not "it looks cool." *Done* means [[Week-16]]: a finished animation on the platform your brief justified, a traceable revision from a real usability finding, an optimization pass with numbers to show for it, a package a stranger could visit — and the story of how you got there, told out loud. Brief. Test. Revision. Shown. That's the whole course, compressed into four weeks and one presentation.

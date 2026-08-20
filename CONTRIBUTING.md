# Contributing to the Course Wiki

This wiki is a git repository of Markdown files — and contributing to it is
part of learning this course. Every change goes through a **pull request**:
the same workflow professional teams use for code, docs, and design systems.

## The one rule

**Nobody pushes to `main`.** Not even when it's a one-character typo. Every
change rides a branch and arrives as a pull request that gets reviewed. That's
not bureaucracy — it's the skill being taught.

## Your first contribution, step by step

1. **Accept the invite** to this repository (check the email tied to your
   GitHub account, or github.com/notifications).
2. **Open the repo on GitHub and press `.`** (period). That opens github.dev —
   a browser editor. No installs needed. (Advanced path: clone locally.)
3. **Create a branch** — name it `yourname/what-it-does`, e.g.
   `jordan/fix-week-3-typo` or `sam/add-rive-resource`.
4. **Make your change** to the Markdown. Small is beautiful — one idea per PR.
5. **Commit** with a message that says what and why: not `update`, but
   `Fix easing typo in Week 3; linear ≠ ease-in`.
6. **Open a pull request** against `main`. The template will ask you three
   questions — answer them like a designer.
7. **Watch the checks.** A robot validates your front-matter, builds the whole
   site with your change in it, and posts a **preview link** — your change,
   rendered, on a real URL. If a check goes red, click into it; the error
   message tells you what broke (it's almost always YAML front-matter).
8. **Respond to review.** The instructor (or the editor of the week) may
   request changes. Push more commits to the same branch; the PR updates
   itself. When it's approved and merged, the public site redeploys
   automatically with your change on it.

## What to contribute

- **Resource entries** — found a great tutorial? Add a `RES-` file to
  `04-Resources/Learning-Resources/` (copy an existing entry's structure,
  take the next free ID, verify the link actually works, leave `quality:`
  unset — entries get rated before the landing page is regenerated).
- **Fixes** — typos, broken links, unclear sentences, wrong dates.
- **Glossary terms**, better examples, improvements to week pages.

## What NOT to do in a PR

- Don't edit `_calendar/` here — the class calendar is edited live on the
  class platform, not through PRs.
- Don't edit files under `platform/` or `showcase/` (the site's engine)
  unless that's explicitly the assignment.
- Don't paste in content you didn't write without a source and a license.

## Front-matter survival guide

Every page starts with a `---` block of YAML. The #1 build-breaker: **a value
containing a colon must be wrapped in double quotes.**

```yaml
title: "Timing: the invisible half of animation"   ✅
title: Timing: the invisible half of animation     ❌ breaks the build
```

The PR check will catch this — but now you know why it went red.

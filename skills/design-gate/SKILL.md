---
name: design-gate
description: "The pre-ship check that catches work looking AI-generated. Run it BEFORE handing any UI to a client, and on any inherited build. Scores the twenty vibecoded tells (purple-to-blue gradient, gradient hero text, emoji headings, Inter everywhere, glassmorphism, low-contrast dark mode, three icon boxes in a row, badge above headline, Lucide everywhere, untouched shadcn, fade-in on scroll, cursor beam, hover fades, inconsistent spacing, em dashes, buzzwords, serif italic accents, Space Grotesk plus Instrument Serif, grain over gradient) against the real code, separates the real tells from the style preferences, and audits the copy, which is usually where the failure actually is. Triggers: does this look AI generated, vibecoded, AI slop, design review, design audit, pre-ship check, before we send it, is this good enough, make it not look templated, generic design, ship check, UI review, why does this look cheap."
---

# Design gate: the check before it ships

This is the **check**, not the direction. Use `frontend-design` or `eugene-premium-web` to decide
what a page should be. Use this to find out whether what got built reads as machine-generated
before a client sees it.

Run it on your own work before shipping, and on anything inherited.

## The one question

Not "which of the twenty tells do we have". The real question is:

> **Which of these choices did we actually make?**

A navy and gold palette chosen because the subject is veterans is a decision. Inter because it
was the default is not. The same font can pass or fail depending on whether anyone chose it. Score
intent, then evidence.

## Score in three buckets, never twenty rules

Applying all twenty mechanically strips a deliberate identity to satisfy a checklist. That is the
same failure in the opposite direction. Sort each item into one of three buckets.

### Bucket 1: real tells. Fix these.

| Tell | Why it reads as generated |
|---|---|
| Purple-to-blue gradient | The single most common generated palette. No subject on earth requires it |
| Gradient hero text | Decoration standing in for hierarchy |
| Emoji in headings | A section marker that carries no meaning |
| Glassmorphism cards | Depth applied everywhere is depth nowhere |
| Low-contrast dark mode | Grey on grey, usually because only one theme was designed and the other was inverted |
| Badge above every headline | Once it is a device. On every screen it is a template |
| Fade-in on scroll, everywhere | Motion with no relationship to the content |
| Cursor-following beam | A demo effect, not a product decision |
| Grain over a gradient | Texture used to rescue a palette that is not working |
| Serif italic accents | The house style of generated landing pages |
| Space Grotesk plus Instrument Serif | The single most recognisable generated pairing |
| Em dashes everywhere | See the copy section. This is usually the worst one |
| Generic buzzwords | "Trusted", "seamless", "powerful", "verified" asserted about yourself |

### Bucket 2: defensible. Judge, do not auto-fix.

| Item | When it is fine |
|---|---|
| Inter everywhere | When it was chosen and paired with something. It is a good face; being popular is not a crime |
| Lucide icons everywhere | When the set is consistent and the brand has its own marks alongside it |
| Colored border cards | A hairline is not a fault. An accent rail on every card is |
| Buttons fade on hover | A pressed state is correct on touch. Judge on the actual target device |
| Three icon boxes in a row | Fine when there are genuinely three things. A tell when the content was padded to three |
| Untouched shadcn | Fine as scaffolding. A tell when it ships with the default radius, shadow and spacing untouched |

### Bucket 3: needs eyes, not grep.

Inconsistent spacing. Render it, screenshot it, look at it. No command finds this.

## The audit, runnable

Run these from the project root. Adjust the source directory.

**Quote every `--include` pattern.** JC's shell is zsh, which expands `--include=*.html` itself and
makes grep fail with "no matches found" before it ever runs. Write `--include="*.html"`.

```bash
SRC=src                       # or app, components, or . for a static site
INC=(--include="*.html" --include="*.css" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx")

# Palette: the generated defaults are purple and indigo
grep -rhoiE "#(6366f1|8b5cf6|a855f7|7c3aed|818cf8|c084fc)" $SRC "${INC[@]}" | sort | uniq -c
grep -rn "linear-gradient\|LinearGradient" $SRC "${INC[@]}" | head -20

# Type: what was chosen, and was anything chosen at all
grep -rhoP "font-family:[^;]{0,60}|fontFamily: *'[^']*'" $SRC "${INC[@]}" | sort | uniq -c | sort -rn
grep -rli "family=Inter\|Space Grotesk\|Instrument Serif" $SRC "${INC[@]}" package.json | head

# Effects
grep -rl "backdrop-filter\|BlurView" $SRC "${INC[@]}" | wc -l
grep -rl "FadeIn\|fade-in\|animate-in\|data-aos" $SRC "${INC[@]}" | wc -l

# Emoji in real copy, not comments
grep -rlP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" $SRC "${INC[@]}" | head

# The eyebrow-on-every-screen template
grep -rho "eyebrow\|kicker\|overline" $SRC "${INC[@]}" | wc -l

# Em dashes, the one that is nearly always present
grep -rc "—" $SRC "${INC[@]}" | grep -v ":0"
grep -rho "—" $SRC "${INC[@]}" | wc -l

# Self-praise
grep -rhoiE "\b(trusted|seamless|powerful|robust|cutting.edge|verified)\b" $SRC "${INC[@]}" | tr A-Z a-z | sort | uniq -c | sort -rn
```

## The copy pass, which is usually where it actually fails

Most builds score well on colour and type and badly on words. Check:

1. **Em dashes.** Count them. Then replace each one **by reading it**, never with a find and
   replace. An em dash is not one thing:
   - "X, not Y" is by far the most common. It becomes a comma.
   - A parenthetical pair becomes two commas.
   - A label separator becomes a colon.
   - A second independent clause becomes a full stop.
   - A dash standing in for a missing value becomes words, like "Not set".
2. **Two exemptions, both about accuracy beating house style.** A verbatim citation or source
   title stays as published, because rewriting it makes the reference unfindable. An official form
   or product name takes whatever the issuer prints, usually a plain hyphen, because a comma would
   misname it.
3. **Self-praise.** The product does not get to call itself trusted, official, verified or
   powerful. Either describe the thing that earns the word or drop the word.
4. **Then add a gate**, so it cannot come back. A unit test that fails on an em dash under the
   source directory, with any exemption listed by path or by line and a companion assertion that
   each exemption still refers to something real, so the allowlist cannot rot into a licence.

## Two traps that will bite you

**A string in the copy can be a key.** Before rewriting any user-facing string, grep for it. On
Veterans Edge, `'Based on service—not disability percentage'` was displayed copy AND an object key
AND a value in a data file. Fixing the component alone would have made the lookup miss and shown
the raw key to users. No crash, no failing test, just worse than before.

**Do not edit generated files or snapshots.** Fix the source or the generator. Editing the
artifact is a fix that gets silently undone on the next build. If the source cannot be found,
exempt the path with a written reason and record the follow-up, rather than faking the fix.

## Worked example: Veterans Edge, scored 2026-09-11

Thirteen of the twenty did not apply. Palette navy `#082957`, gold `#E7C157`, red `#C92E38`, no
purple. Gradients red to navy and navy to gold. No blur, no scroll animation, no cursor beam, no
Inter, no Space Grotesk. Emoji were checkmarks used as checkbox state.

Three real hits, and the design was not one of them:

- **122 em dashes** in copy users read.
- **"Trusted tools and official resources"** on the home screen, self-praise.
- **31 screens** opening with the same small caps eyebrow above the headline.

The lesson worth carrying: the list invites a redesign, and the actual problem was the writing.
Repainting the colours would have been busywork. Full scoring in
`notes/design-gate-vibecoded-tells.md`.

## Output

Report as a table: item, verdict (CLEAN, HIT, JUDGEMENT, NEEDS EYES), and the evidence, meaning a
count, a file and line, or a hex value. No verdict without evidence. Then a short list of what to
fix in priority order, and say plainly which items you are choosing not to fix and why.

## Second worked example: a delivered client site, scored 2026-09-11

Run on a delivered client site, using the corrected commands above, to prove the gate travels
between projects rather than only fitting the one it came from.

| Item | Verdict | Evidence |
|---|---|---|
| Purple-to-blue gradient | CLEAN | Zero hits on the six generated-default hexes |
| Inter, Space Grotesk, Instrument Serif | CLEAN | None present. The faces are Bebas Neue, Manrope and Plus Jakarta Sans, a deliberate pairing |
| Fade-in on scroll | CLEAN | Zero |
| Glassmorphism | **HIT** | `backdrop-filter` in 13 files |
| Emoji in copy | **HIT** | 8 files |
| Em dashes | **HIT** | 81 across 10 files |
| Self-praise | **HIT** | "trusted" 24 times |

Four real hits on a site already delivered, found in under a minute, and the type and palette came
back clean, which is the pattern: the design was chosen, the copy was not.

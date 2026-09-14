---
name: best-ui
description: "The single entry point for any UI job. Say \"best-ui\" and this picks the right three or four skills for the job, in the right order, and refuses to run the ones that contradict each other. Use INSTEAD of naming skills yourself, and instead of asking to apply all of them. Triggers: best ui, make the best ui, apply all the skills, use all the design skills, which skill should I use, build the UI, redesign this, make this premium, make it look expensive, design this page, design this screen, client UI, make Chris happy with the UI."
---

# best-ui: one phrase, the right skills, in order

JC asked whether he can just say "apply all the skills". The answer is no, and this skill exists
so he never has to name them.

## Why "apply all the skills" makes it worse

There are 63 skills installed and at least nine of them are design skills with overlapping scope.
Loaded together they do not add up, they argue:

| Conflict | What happens |
|---|---|
| `premium` wants Apple-inspired restraint. JC's own record says restraint read as "i just see of those i basic not a premium" on the Stern Bridge site | Following `premium` blindly reproduces a rejection he already paid for. See [[feedback_no_dry_designs]] |
| `ui-ux-pro-max` offers 67 styles, 96 palettes and 57 font pairings. `frontend-design` says do not spend your freedom on a default | A menu invites picking from the menu, which is how templated work happens |
| `hallmark` and `design-gate` are both anti-slop passes | Running both duplicates the work and doubles the report |
| `eugene-premium-web` targets custom HTML on Vercel or scoped GHL code. `ui-gohighlevel-designer` demands scoped GHL output always | On a React or Expo app both are wrong and will fight the stack |

Every skill also spends attention. Loading fifty irrelevant ones (n8n, Shopify, ads, PDF) buries
the four that matter.

## The three things no skill can supply

Before routing, get these. If they are missing, ask for them in one message and stop. A skill
applied to a vague brief produces a generic result, which is the exact failure being avoided.

1. **What it is.** One concrete subject. Not "a page", but "the claim funnel landing page for
   veterans filing a disability increase".
2. **Who it is for.** The reader, and what they know already.
3. **The one job.** What this screen must make happen. One thing, not four.

For Stern Bridge work, add: which surface, because the stack decides the route. The Veterans Edge
app is Expo and React Native. The tracker is Apps Script HTML. Client sites are custom HTML on
Vercel. GHL sections are scoped custom code.

## The route

Pick one row. Run the skills in the order given. Do not add the ones in the last column.

| Job | Run, in this order | Never also run |
|---|---|---|
| New client site, landing page, funnel, sales page | `eugene-premium-web` for the build flow, then `frontend-design` for the direction, then `landing-page-design` for the layout and CTA, then `copywriting`, then `design-gate` | `premium`, `ui-ux-pro-max` |
| A section inside GoHighLevel | `ui-gohighlevel-designer` alone for the scoped output, then `copywriting`, then `design-gate` | `eugene-premium-web`, `frontend-design` |
| A screen in the Veterans Edge app, or any React or Expo product UI | `frontend-design` for direction, then `ux-writing` for the copy, then `design-gate` | `landing-page-design`, `eugene-premium-web` |
| A staff or internal tool, like the tracker | `ux-writing` first, because clarity beats beauty here, then `design-gate` | `premium`, `landing-page-design`, `hallmark` |
| Polish an existing screen that is already close | `ui-ux-polish`, then `critique-typography`, then `design-gate` | anything that starts a redesign |
| Judge whether something is good enough to send | `design-gate` alone | everything else, until it reports |
| Accessibility, or a client who asked about compliance | `wcag-accessibility-audit`, then `web-design-guidelines` | the aesthetic skills, they are a different question |
| One interaction or transition | `micro-interaction-spec` or `page-transitions` | the whole design stack |

`icon-design` joins any row that needs icons. `design-gate` ends every row that produces UI. That
is the only skill that runs on every job.

## The order matters, and it is always this

1. **Direction** before pixels. Decide the identity, then build to it.
2. **Build.**
3. **Copy**, as its own pass. On both audits run so far, the design was chosen and the copy was
   not. That is where the work reads as machine-made.
4. **Check**, with `design-gate`, before anyone outside sees it.
5. **Screenshot every section**, not just the hero. The weak sections are the ones nobody
   screenshots.

## What JC types

> best-ui, [what it is], for [who], the job is [one thing]

Everything else is my problem, not his. If the brief is thin I ask once, then proceed.

## The standing rules that outrank any skill

These come from JC's own record and win over anything a skill suggests:

- **No em dashes** in anything produced. See [[feedback_no_em_dashes]].
- **No dry designs.** Background rhythm, a structural device true to the subject, a real ending.
  Restraint without material richness reads as thin, not premium. See [[feedback_no_dry_designs]].
- **The product never praises itself.** Trusted, seamless, powerful, verified, official are claims.
- **A website brief before a new client site.** See [[feedback_website_brief_first]].
- **No deploys without JC's go.**
- **Never name JC's other clients** inside one client's work.

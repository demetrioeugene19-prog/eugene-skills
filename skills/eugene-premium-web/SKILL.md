---
name: eugene-premium-web
description: "Eugene's playbook for building premium, stunning, high-converting websites and funnels for clients (custom-coded HTML/CSS/JS, deployed to Vercel, or scoped GHL custom code). Use when building or redesigning ANY client website, landing page, funnel, sales page, proposal page, or web section. Triggers: build a website, client site, landing page, funnel, sales page, VSL, proposal page, redesign, premium web, stunning design, hero section, make it look expensive. Bakes in the 3 design tools (haikei, fontjoy, godly), Eugene's proven design systems, hard rules (no em-dashes, mobile verify), and the deploy flow."
---

# Eugene's Premium Web Build Playbook

Build websites and funnels that look expensive in the first 3 seconds and convert clicks into booked appointments. This is the distilled workflow behind Eugene's live sites (tabieta.com, yourpowersuite.com) and premium proposal pages. Pair this with `frontend-design`, `landing-page-design`, and `copywriting` skills when they add value.

## The 3 design tools (free, browser-based, nothing to install)

Use these to lift a build from "nice" to "stunning." They are assets/inspiration helpers, not required, generate equivalents in code when the user cannot provide them.

1. **haikei.app** — free SVG background generator (blobs, layered waves, mesh gradients, low-poly, scatter). Exports SVG/PNG. USE FOR: a unique hero background so the site never looks flat. Ask the user to generate one and export the SVG, then embed it; OR generate a similar effect in code (CSS mesh gradient, inline SVG blobs, animated gradient).
2. **fontjoy.com** — AI font-pairing generator. USE FOR: discovering fresh display+body pairings. Not essential (Eugene's proven pairings below usually win).
3. **godly.website** (now recent.design) — curated gallery of award-tier premium sites. USE FOR: inspiration/direction before building. Ask the user for 1-2 reference links they love, then adapt that premium level to the client's brand.

**Winning combo:** browse godly for direction -> generate a hero SVG on haikei -> code a premium custom site with a strong pairing below.

## Eugene's proven design systems (pick one per brand, never reuse the same look for two clients)

| Name | Vibe | Palette | Fonts |
|---|---|---|---|
| Petrol Refined | Sleek high-end agency (Eugene's own portfolio) | petrol #08100F, mint #34E3BF, amber #F0B267 | Syne + Instrument Serif italic + Plus Jakarta Sans + JetBrains Mono |
| Gold Luxe | Premium, editorial, wealthy | espresso #0B0908, gold #D4AF37/#F2D98C | Fraunces serif + Plus Jakarta Sans + IBM Plex Mono |
| Dark Premium | High-contrast dev/tech | near-black #040608, teal/cyan #22d3ee | Syne + Plus Jakarta Sans |
| Soft Wellness | Calm clinical-meets-warm (health/medspa) | cream #F7F5F0, sage-emerald #1E9E7E, gold | Fraunces + Plus Jakarta Sans |
| Luxe Auto / Contractor | Premium local service, glassy | navy #0B1622, gold #C9A24B | Sora + Plus Jakarta Sans |
| Bold Glow | Warm energetic aurora | dark + orange sunset | Bebas Neue + Manrope |

Always: characterful DISPLAY face used with restraint + clean BODY face + optional MONO for labels/data. Match personality to the subject, do not default.

## The build workflow

1. **Brief first.** Confirm the business, audience, and the page's single job. If a client intake exists, use REAL content (name, services, service area, about text), never placeholder.
2. **Direction.** Pick a design system above (or a godly reference). One aesthetic risk per build, everything else quiet.
3. **Structure (conversion order):** hero (outcome headline + sub + CTA + proof) -> trust strip -> services/benefits -> how it works -> gallery/proof -> testimonials -> offer/quote form -> FAQ -> final CTA -> footer. For contractors/local: click-to-call in top bar, hero, and footer.
4. **Build** custom HTML/CSS/JS, single file or clean structure. Scroll reveals (IntersectionObserver), tasteful motion, one signature moment.
5. **Verify with screenshots** (see hard rules) at desktop AND mobile before calling it done.
6. **Deliver/deploy** (see below).

## Hard rules (never skip)

- **NO em-dashes** anywhere (UI, copy, meta). Use commas/periods/colons. `grep -c '—' file.html` must return 0.
- **Mobile-first + verify:** macOS headless Chrome enforces a ~485-500px min window, so test true mobile by wrapping the page in a 375px-wide `<iframe>` and screenshotting that. `scroll-behavior:smooth` breaks anchor-jump screenshots (use a temp copy with auto).
- **Performance:** extract base64 images to files, `loading="lazy" decoding="async"` below the fold, `fetchpriority="high"` on the hero image, JPEG q70-75 for photos, keep hero image lean.
- **Accessibility:** visible `:focus-visible` rings, `prefers-reduced-motion` kill switch, `<noscript>` fallback so reveals never hide content if JS fails, real alt text, aria-hidden on decorative SVGs.
- **Don't look AI-generated:** avoid perfect symmetry everywhere. Add 1-2 human touches (a handwritten-font margin note via Caveat, a slightly tilted "taped" photo, a P.S.). Kill the auto-scroll marquee if it reads as a template tell. Do text/logo in the design, not fake photos with garbled text.
- **Images:** for stock, download several candidates and VIEW them before using (random Unsplash IDs return wrong images). Note that placeholders should be swapped for the client's real photos.
- **Sticky header bug to avoid:** never let a grouped `main,header,footer{position:relative;z-index:1}` rule out-specify a `.header{position:sticky;z-index:40}` rule, it silently breaks the sticky nav. Keep header out of that group.

## Forms + automation

- Contact/quote forms: name, phone, email, project type, message. Wire to Web3Forms for standalone sites (key lives in a hidden input) OR to GHL when importing to a client's account.
- Client sites deploy to the Eugene Vercel account (`demetrioeugene19@gmail.com`), `npx -y vercel --prod --yes` from the folder (gh/vercel CLI not global on the Mac, use npx).
- NEVER deploy client work without the user's explicit go. Preview links are fine for review.
- Also output scoped GHL custom code (all CSS namespaced to a root id) when the client builds inside GoHighLevel.

## Signature moves that read as premium

- Animated SVG or mesh-gradient hero background (haikei-style), gentle and slow.
- Scroll-reveal with small stagger. Animated stat counters. 3D tilt/parallax on a hero card or mockup.
- Custom favicon (inline SVG data URI). OG tags. A confident type scale with one oversized display moment.
- A single memorable "signature" element per page, everything else disciplined.

---
name: client-dashboard-builder
description: Build, extend or fix a live client dashboard as a Google Apps Script web app (password login, cached numbers, background triggers) fed by GoHighLevel (GHL) emails/contacts, Calendly bookings, Slack and Google Sheets, in the premium dark "sales dashboard" look with an animated login (3D tunnel, lamp or envelope). Use this whenever someone asks for a sales dashboard, email marketing dashboard, KPI or performance page for a GHL/FG Funnels client, wants open/click rates, calls booked from email, revenue by closer/setter, a month-vs-last-month comparison, a "live" page embedded on a GHL funnel page, or says things like "make a dashboard like the client's", "same as the sales dashboard", "connect it to GHL and Calendly", even if they don't say Apps Script.
---

# Client dashboard builder

This skill packages how the Example Client sales and email dashboards were built (Nov 2026) so the same thing can be done for any client quickly and safely. Two working dashboards are the reference: a **sales dashboard** (Calendly calls, Slack setter posts, Sales Data sheet) and an **email dashboard** (GHL emails, opens/clicks, calls booked from email, revenue from email). The email dashboard's full code is in `assets/email-dashboard/` and is the best starting point.

## How the person you're helping works

The people using this are a small agency team, not engineers. Usually one person talks to you and pastes code into Apps Script, and someone else approves anything that touches the client's live accounts. So:

- Give **step-by-step paste/deploy instructions** with exact menu names (they will follow them literally), one small step at a time, and wait for screenshots.
- **Read-only first, confirm every live write.** Pulling data, testing locally and building files is fine. Creating GHL keys, workflows, pages, sheets or anything visible to the client needs an explicit OK first.
- **Never print keys or tokens**, not even partially. Keys live in a local `.env` (for your read-only tests) and in Apps Script Script Properties (for the live app). If a screenshot shows a key, say so and suggest cropping next time.
- Client-facing messages go out under the agency contact's name only. Keep them short, plain, no em dashes, and explain them to the person underneath.

## The build, in order

Work through these steps and show progress after each one. Skipping step 1 is how dashboards end up with wrong numbers.

1. **Check the data (read-only).** Pull a real sample from every source before designing anything: how many records, which fields exist, what's missing. Look for surprises (for example, an export that has no open/click status, a big one-off batch that skews a month). See `references/data-sources.md`.
2. **Agree the design.** Make an HTML mockup with sample numbers, screenshot it at desktop (1440) and phone (390), and get approval. Default to the house look in `references/design-system.md` unless they want something else; ask for screenshots of any reference site (you often can't open Instagram or login-walled pages).
3. **Build the back end** (`Code.gs`): login, data loaders, caching, background trigger. Start from `assets/email-dashboard/Code.gs`. Architecture and gotchas: `references/architecture.md`.
4. **Test it locally against live data** before anyone pastes it. Run the real `Code.gs` in Node with `scripts/apps_script_harness.js` (fake Apps Script services, real read-only API calls). Compare the numbers with the source (for example, check every email's status for 1-2 days and compare with the sampled estimate).
5. **Build the page** (`Index.html`) from the approved mockup, wired to `google.script.run`. Test with `scripts/page_test.py`, which stubs the server with a saved payload and screenshots desktop + phone, and checks for page errors and sideways scroll.
6. **Login screen.** Pick one of the animated logins in `references/login-screens.md` (tunnel is the current favourite). The login card always matches the house card.
7. **Deploy with them**, step by step (see "Deploy steps" in `references/architecture.md`), then check the live page together from their screenshots.
8. **Launch**: embed on a GHL page, final check on desktop + phone, short launch message with the link. See `references/launch.md`.

After each meaningful step, append a dated line to the project's handoff/log file so the next session (or the other teammate) can pick up.

## Things that bite (read before building)

- **Paste the right file.** Keep one `Code.gs` per Apps Script project in the repo and never keep a second "test" copy next to it with the same name; a wrong paste shows up live as "Script function not found".
- **Deploy = new version.** Page or server changes only go live after Deploy → Manage deployments → ✏️ → Version: New version → Deploy. Triggers run the *saved* code, so a trigger-only change needs just Save.
- **Quotas.** UrlFetch is about 20,000 calls/day per Google account, shared by every project on that account. Count calls, cache aggressively, and give each project its own daily cap.
- **Sampling undercounts rare events.** Opens are fine from a sample of ~30 per email per day; clicks (~1-2%) are not. Check every email for the current month and sample only older months.
- **Never let a past cache hide a fix.** Version your cache keys (`dash13_`, `email1_`, `inv2_`) and bump them when the data shape changes.
- **Big batches distort comparisons.** A one-off nurture blast can make "vs last month" look like a 78% drop. Explain it rather than "fixing" it.
- **Things that look broken but aren't** usually come from settled vs unsettled days, cached copies or the month boundary in ET. Check those before changing code.

## Files in this skill

- `references/architecture.md`: Apps Script project layout, login/session, caching, triggers, quotas, deploy steps, separate-project vs same-project decision.
- `references/data-sources.md`: GHL email export + per-email status, sequence mapping, Calendly bookings + UTM + "email behind the booking", Sales sheet column detection, Slack.
- `references/design-system.md`: colors, fonts, layout (sidebar, hero, toolbar, cards), animations, phone rules.
- `references/login-screens.md`: tunnel, envelope and lamp logins, the shared login card, how to rebrand them.
- `references/launch.md`: GHL page embed, launch checklist, client message, spreading progress across EODs.
- `assets/email-dashboard/Code.gs` + `Index.html`: the complete working email dashboard (Example Client). Client-specific values are listed at the top of `references/architecture.md`.
- `assets/login-tunnel.html`: the tunnel login as a standalone page (great for showing a client a preview).
- `scripts/apps_script_harness.js`: run Apps Script code in Node against live read-only APIs.
- `scripts/page_test.py`: screenshot and smoke-test `Index.html` with a fake server.

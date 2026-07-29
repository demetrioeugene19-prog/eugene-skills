---
description: Generate a value-based, client-ready end-of-day report and save it to the project.
argument-hint: "[project name — optional]"
---

Generate an **end-of-day (EOD) report** for today's work.

**Project:** `$ARGUMENTS`
If no project is given, infer the project worked on today from this conversation
(default: the JARVIS voice project under `projects/jarvis-voice/`). Infer the
client/stakeholder name from the project and memory.

## Rules — read first
- Report **only work that was genuinely done today.** If something was started but
  not finished, mark it "in progress." Never invent or pad work.
- Frame everything around **deliverables and the value they create** — NOT hours.
  Do **not** state, imply, or justify a number of hours worked. The report stands
  on what was shipped.
- Client-facing parts: plain language, no technical jargon, no internal tool names.

## Steps
1. Review what was accomplished today from this conversation, the project's files
   (`projects/<project>/`), and memory.
2. Write the report in the two parts below.
3. Save Part A to a file; show both parts in chat, copy-paste ready.

### PART A — Internal record → save to `projects/<project>/eod-<YYYY-MM-DD>.md`
- **Summary** — one or two sentences on the day.
- **What shipped today** — each deliverable, plain language, each with a one-line
  "what it does."
- **Status** — tested / live / in progress, stated honestly.
- **Open / next** — what's pending, and the recommended next step.

### PART B — Client message (copy-paste)
A short, friendly update for the client. Format:
- Open with: `Hey [client] — here's my accomplishment today:`
- Bullet the deliverables, each saying what it does for their business.
- Close with one forward-looking line.
- No hours, no effort claims, no mention of how the work was built.

Keep it sharp, confident, and honest — let the delivered value carry it.

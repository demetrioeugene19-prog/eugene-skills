# Eugene Skills

My Claude Code skill library. 65 skills plus slash commands, moved between machines with this repo.

A skill is a folder of instructions Claude loads when a task matches it. Nothing to run, nothing to install beyond putting the folders in the right place.

---

## Install on a new machine

**1. Clone it**

```bash
git clone https://github.com/demetrioeugene19-prog/eugene-skills.git
cd eugene-skills
```

**2. Copy the folders in**

Everywhere on the machine (recommended):

```bash
mkdir -p ~/.claude/skills ~/.claude/commands
cp -R skills/* ~/.claude/skills/
cp -R commands/* ~/.claude/commands/
```

One workspace only, replace the path with the real one:

```bash
mkdir -p "$HOME/EUGENE SYSTEM/.claude/skills" "$HOME/EUGENE SYSTEM/.claude/commands"
cp -R skills/* "$HOME/EUGENE SYSTEM/.claude/skills/"
cp -R commands/* "$HOME/EUGENE SYSTEM/.claude/commands/"
```

**3. Restart Claude Code**, then ask it to list available skills.

---

## The design and UI stack

This is the part that does the visible work. Two of these are entry points, use them instead of naming individual skills.

### Start here

| Skill | Say this | What it does |
|---|---|---|
| `best-ui` | **"best-ui"** then what you are building | Routes to the right three or four design skills for the job and refuses the ones that contradict each other. Nine of the design skills below give conflicting advice, so this picks, you do not. |
| `design-gate` | **"design gate"** before sending anything | Scores twenty tells that make a build read as AI generated: purple-to-blue gradients, gradient hero text, emoji headings, Inter everywhere, glassmorphism, three icon boxes in a row, untouched shadcn, fade-in on scroll, em dashes, self-praising copy. Audits the copy too, which is usually where the failure is. |

### GoHighLevel

| Skill | What it does |
|---|---|
| `ui-gohighlevel-designer` | Scoped, paste-ready HTML, CSS and JS for GoHighLevel funnels and pages. Mobile first, styles namespaced to a root id so a block can never leak into another section. |
| `eugene-premium-web` | My own build playbook: proven design systems, the conversion build order, hard rules (no em dashes, verify at 375px, the sticky-header bug), forms, and the GHL and Vercel deploy flow. |
| `gohighlevel` | GoHighLevel platform operations. |
| `client-dashboard-builder` | **"make a dashboard like the client's"**: a live client dashboard as a Google Apps Script web app (password login, cached numbers, background triggers) fed by GHL emails and contacts, Calendly, Slack and Google Sheets, with an animated login. Includes a complete working email dashboard with every client value as a placeholder (`<GHL_LOCATION_ID>`, `<CALENDLY_ORG_ID>`, `<SALES_SHEET_ID>`, team names, subject lines). |

### Craft

| Skill | What it does |
|---|---|
| `hallmark` | Anti-AI-slop design. Greenfield pages, audits, redesigns, and extracting a design direction from a URL or screenshot. |
| `impeccable` | The broad interface skill: hierarchy, information architecture, cognitive load, accessibility, responsive behaviour, theming, motion, error states, design tokens. Also for bland work that needs to get bolder, or loud work that needs to get quieter. |
| `premium` | Apple-inspired aesthetic: precise spacing, modern type, refined restraint. |
| `frontend-design` | Distinctive visual direction, typography, avoiding templated defaults. |
| `landing-page-design` | Conversion layout: above the fold, hero formula, CTA psychology, social proof placement. |
| `ui-ux-pro-max` | Styles, palettes, font pairings, chart types, component patterns across many stacks. |
| `ui-ux-polish` | Iterative polishing: desktop and mobile refined separately, accessibility audit, design-system alignment. |
| `web-design-guidelines` | General guardrails. |

### Detail work

| Skill | What it does |
|---|---|
| `ux-writing` | Interface copy: buttons, labels, errors, empty states, onboarding. The part most builds get wrong. |
| `critique-typography` | Reviews type on a rendered screen: scale, readability, consistency. |
| `icon-design` | Picks semantically correct icons from Lucide, Heroicons or Phosphor. Prevents emoji. |
| `page-transitions` | Route changes, view transitions, modal open and close. |
| `micro-interaction-spec` | Specifies one interaction completely for handoff. |
| `wcag-accessibility-audit` | WCAG 2.1 and 2.2 audit across the four POUR principles. |
| `app-icon-optimization` | App icon design and tap-through rate. |
| `dataviz` | Charts, dashboards, stat tiles. Read before writing any chart code. |
| `vercel-react-best-practices` | React and Next.js patterns for Vercel. |

---

## Everything else in here

**Paid ads and analytics**
`ads` `ads-google` `ads-meta` `ads-tiktok` `ads-creative` `ads-competitor` `analytics-tracking` `google-analytics-data-api-basics`

**SEO and content**
`seo-audit` `ai-seo` `content-strategy` `copywriting` `cro` `emails` `cold-email`

**CRM and automation**
`airtable-automation` `chatbot-flow-design`

**n8n, 13 skills**
`n8n-workflow-patterns` `n8n-agents` `n8n-code-javascript` `n8n-code-python` `n8n-error-handling` `n8n-expression-syntax` `n8n-mcp-tools-expert` `n8n-node-configuration` `n8n-validation-expert` `n8n-subworkflows` `n8n-binary-and-data` `n8n-multi-instance` `n8n-self-hosting`

**Documents**
`docx` `xlsx` `pptx` `pdf`

**Media**
`ffmpeg` `speech-to-text` `text-to-speech` `agents` `watch`

**Meta**
`prompt-engineering-patterns` `find-skills` `shopify-admin`

---

## Two rules these skills enforce

**No em dashes in anything produced.** Replace each one by reading the sentence, never with find and replace. Then grep for the character before shipping and confirm zero. The exemptions are a verbatim citation and an official product name.

**The product never praises itself.** Trusted, seamless, powerful, verified and official are claims. Either describe the thing that earns the word or cut the word.

---

## Adding or editing a skill

Each skill is a folder with a `SKILL.md` inside. The frontmatter needs a `name` and a `description`, and the description is what Claude matches against, so write it as the situations the skill is for, not a summary of its contents.

After editing on either machine:

```bash
git add -A && git commit -m "what changed" && git push
```

On the other machine, `git pull` then re-copy into `.claude/skills/`.

---

## Never put secrets in here

This repo is public. Tokens, API keys, client names and client data belong in a project `.env`, never in a skill file.

Before pushing:

```bash
grep -rIlE "pit-[0-9a-f]{8}|pat[A-Za-z0-9]{16,}|sk-ant-api|gho_[A-Za-z0-9]{20,}|AIza[A-Za-z0-9]{20,}" .
```

That should return nothing.

# Eugene skills

My Claude Code skill library. 50 skills plus 1 slash command, moved between machines with this repo.

A skill is a folder of instructions Claude loads when a task matches it. Nothing to run, nothing to install beyond putting the folders in the right place.

---

## Install on a new machine

**1. Clone it somewhere sensible**

```bash
cd ~/Documents
git clone https://github.com/demetrioeugene19-prog/eugene-skills.git
cd eugene-skills
```

**2. Decide where the skills live**

| Option | Path | Use when |
|---|---|---|
| **Everywhere** (recommended) | `~/.claude/skills/` | You want these in every project on the machine |
| One workspace only | `<workspace>/.claude/skills/` | Matches how the Mac is set up today |

**Everywhere:**
```bash
mkdir -p ~/.claude/skills ~/.claude/commands
cp -R skills/* ~/.claude/skills/
cp -R commands/* ~/.claude/commands/
```

**One workspace** (replace the path with the real one):
```bash
mkdir -p "~/Documents/EUGENE SYSTEM/.claude/skills"
cp -R skills/* "~/Documents/EUGENE SYSTEM/.claude/skills/"
cp -R commands/* "~/Documents/EUGENE SYSTEM/.claude/commands/"
```

**3. Restart Claude Code**, then ask it to list available skills. All 50 should appear.

---

## What is in here

**Client web work**
`eugene-premium-web` · `ui-gohighlevel-designer` · `landing-page-design` · `frontend-design` · `web-design-guidelines` · `ui-ux-pro-max` · `copywriting` · `cro` · `vercel-react-best-practices`

`eugene-premium-web` is the important one. It holds the house rules: no em-dashes, verify on mobile, the design systems, the deploy flow.

**Paid ads and analytics**
`ads` · `ads-google` · `ads-meta` · `ads-tiktok` · `ads-creative` · `ads-competitor` · `analytics-tracking` · `google-analytics-data-api-basics`

**SEO and content**
`seo-audit` · `ai-seo` · `content-strategy` · `emails` · `cold-email`

**CRM and automation**
`gohighlevel` · `airtable-automation` · `chatbot-flow-design`

**n8n, 13 skills**
`n8n-workflow-patterns` · `n8n-agents` · `n8n-code-javascript` · `n8n-code-python` · `n8n-error-handling` · `n8n-expression-syntax` · `n8n-mcp-tools-expert` · `n8n-node-configuration` · `n8n-validation-expert` · `n8n-subworkflows` · `n8n-binary-and-data` · `n8n-multi-instance` · `n8n-self-hosting`

**Documents**
`docx` · `xlsx` · `pptx` · `pdf`

**Media**
`ffmpeg` · `speech-to-text` · `text-to-speech` · `agents` (ElevenLabs voice) · `watch` (video analysis)

**Meta**
`prompt-engineering-patterns` · `find-skills`

**Command:** `/eod`, generates a client-ready end of day report.

---

## Adding or editing a skill

Each skill is a folder with a `SKILL.md` inside. Frontmatter needs a `name` and a `description`, and the description is what Claude matches against, so write it as the situations the skill is for, not a summary of its contents.

After editing on either machine:

```bash
git add -A && git commit -m "what changed" && git push
```

On the other machine, `git pull` then re-copy into `.claude/skills/`.

---

## Never put secrets in here

This repo is private, but skills get copied and shared. Tokens, API keys and client data belong in a project `.env`, never in a skill file.

Before pushing:

```bash
grep -rIl -E "pit-[0-9a-f]{8}|pat[A-Za-z0-9]{16,}|sk-ant-api|gho_[A-Za-z0-9]{20,}|AIza[A-Za-z0-9]{20,}" .
```

That should return nothing.

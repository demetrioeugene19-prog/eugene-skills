# Architecture

## Contents
1. Client-specific values to replace
2. Project layout
3. Login and sessions
4. Caching, triggers and quotas
5. Same project or separate project
6. Deploy steps (what to tell the person)

## 1. Client-specific values to replace

When reusing `assets/email-dashboard/Code.gs` for a new client, change these at the top of the file:

| Value | What it is | Where to find it |
|---|---|---|
| `TZ` | Client's time zone (all day/month boundaries use it) | Ask; the client was `America/New_York` |
| `ORG` | Calendly organization URI | `GET https://api.calendly.com/users/me` → `current_organization` |
| `CLOSERS`, `CLOSER_BY_HOST`, `ALIASES`, `SETTERS` | Team names as they appear in Calendly hosts and the sales sheet | Calendly event memberships, the sheet's closer column |
| `QUALIFYING_EVENT` | The sales-call event name to count (lower case, "contains" match) | Calendly event types |
| `SALES_SHEET` | Google Sheet ID of the sales log (month tabs like "November 2026") | The sheet URL |
| `GHL_LOCATION` | GHL sub-account (location) ID | GHL settings / `.env` |
| `EMAIL_SEQUENCES`, `EMAIL_CLIENT`, `EMAIL_SKIP` | Which email subjects belong to which sequence, which are client-program or staff emails | Build per client, see data-sources.md |

In `Index.html`: the logo `<img>` data URI (sidebar + login card), the client name in titles and copy, and colors if the brand differs.

## 2. Project layout

One Apps Script project per dashboard:

- `Code.gs`: everything server-side. Public functions (no trailing `_`) can be called from the page: `login(password)`, `getDashboard(month, force, token)` / `getEmailDashboard(month, token)`, `saveGoals(...)`. Helpers end in `_` so the page can't call them. Trigger handlers (`warmCache`, `emailSync`) check `e && e.triggerUid` and return otherwise, so the page can't fire them.
- `Index.html`: the whole page (CSS + JS inline). Served by `doGet()` with `setXFrameOptionsMode(ALLOWALL)` so it can sit inside a GHL page iframe.
- Script Properties: secrets and small state. `GHL_TOKEN`, `CALENDLY_TOKEN`, `SLACK_TOKEN`, `DASH_PASSWORD` (replaced by a hash on first login), `SESSION_SECRET` (auto), daily counters, day-level email results (`em_yyyy-MM-dd`), shared goals.

The sales dashboard additionally has a local source page (`sales-dashboard/app/dashboard.html`) and `build.py`, which turns it into `Index.html` (swaps `fetch` for `google.script.run`, adds login). The email dashboard skips that and edits `Index.html` directly, which is simpler.

## 3. Login and sessions

- One shared team password. `DASH_PASSWORD` is hashed with the session secret on first login and deleted (`DASH_PASSWORD_HASH` stays). To change the password, add `DASH_PASSWORD` again; everyone is logged out.
- `login()` returns `expires.signature` (HMAC of the expiry with secret + password hash), valid 7 days. Every data call checks it (`tokenOk_`) and throws `LOGIN_REQUIRED` otherwise; the page then shows the login.
- Wrong tries: 1.5 s pause each, 15-minute lock after 20 wrong tries.
- The page keeps the token in `localStorage` (wrapped in try/catch). Use a different storage key per dashboard (`socEmailToken`).
- The client decides whether two dashboards share a password. A separate password lets, say, an email marketer see only the email dashboard.
- Prefer **read-only API keys** (GHL Private Integration with only the scopes needed: View Conversations, View Conversation Messages for the email dashboard).

## 4. Caching, triggers and quotas

- Page data is cached in `CacheService` per month: 20 min for the current month, 1 h for past months, 60 s if a source failed (so a refresh retries). The page always asks for the cached copy; a background trigger keeps it fresh, so logins load in a few seconds instead of ~20.
- `setupTrigger()` (run once from the editor) creates time triggers every 10 minutes: `warmCache` (sales) or `emailSync` (email). If the dashboard is slow again, check Triggers first.
- Count every `UrlFetchApp` call (`fetchCount_`, saved per Pacific day, because that's Google's quota day) and stop background work at ~80% of the project's cap.
- Calendly invitees are cached per event (6 h once the call is 2+ days old, 30 min before), which is most of the Calendly cost.
- `CacheService` values max ~100 KB and 6 h; Script Properties ~9 KB per value and ~500 KB total. Fold old day-level data into one row per month (see `emailTidy_`).

## 5. Same project or separate project

A second dashboard can be another page in the same project (shares password, keys, quota counter) or its own project (own link, password, keys, trigger). Choose a separate project when different people should see different dashboards or when you don't want to risk the live one. Copy the shared helpers (login, Calendly, sales sheet) into the new `Code.gs`; it's fine to duplicate them.

## 6. Deploy steps (what to tell the person)

First time:
1. script.google.com → New project (on the Google account that can open the client's sheets). Rename it.
2. Paste `Code.gs`. Add an HTML file named exactly `Index` and paste `Index.html`. Save.
3. Project Settings (gear) → Script Properties → add the keys and `DASH_PASSWORD`. Save script properties.
4. Pick a test function (for example `testEmail`) in the function dropdown → Run → allow permissions (Advanced → Go to … (unsafe) → Allow; normal for your own scripts). Ask for the Execution log screenshot.
5. Pick `setupTrigger` → Run. Check Triggers (clock icon).
6. Deploy → New deployment → gear → Web app → Execute as: Me, Who has access: Anyone → Deploy → copy the Web app URL.

Every update after that: paste the changed file(s) → Save → Deploy → Manage deployments → ✏️ → Version: New version → Deploy. The URL stays the same. Trigger-only changes just need Save.

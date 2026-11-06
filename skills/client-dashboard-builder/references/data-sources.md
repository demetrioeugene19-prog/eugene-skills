# Data sources

## Contents
1. GHL emails (sent, opened, clicked)
2. Sorting emails into sequences
3. Calendly bookings and "calls booked from email"
4. The email behind each booking
5. Sales sheet and revenue from email
6. Slack setter posts
7. Checking the numbers

All examples are read-only GETs. Base URL `https://services.leadconnectorhq.com`, headers `Authorization: Bearer <key>`, `Version: 2021-04-15`, `Accept: application/json`. From Python/curl also send a normal `User-Agent` (the default Python one gets 403); Apps Script's own is fine.

## 1. GHL emails

- **List every email:** `GET /conversations/messages/export?locationId=…&channel=Email&limit=500&startDate=<ISO>&endDate=<ISO>&cursor=<nextCursor>`. Use full ISO times (`2026-11-02T05:00:00.000Z`) for exact days in the client's time zone; date-only values shift. Each message has `id`, `subject`, `contactId`, `dateAdded`, `source` (`workflow` = automated, `app` = sent by hand). The status here is always "sent", so it can't give opens.
- GHL sometimes ends the list early when busy. Compare the number read with the response's `total` and read again once if short (see `ghlEmails_`).
- **Opens and clicks:** `GET /conversations/messages/email/{id}` gives `status`: `delivered`, `opened` or `clicked` (clicked implies opened). One call per email.
- Strategy: check an email once it's ~3 days old (most opens have happened), store the result per day, never re-check it. Every email for the current month (exact numbers); a sample of ~30 per subject per day for older months (keeps a big back-fill inside the quota). Estimated opens for a subject-day = sent × opened/checked.
- Rate limit is about 100 requests per 10 s: batch 45 with `UrlFetchApp.fetchAll` and sleep ~5 s between batches.

## 2. Sorting emails into sequences

GHL's email records don't say which workflow sent them, and the workflow API doesn't expose steps. What worked:

1. Pull a month or two of subjects with counts.
2. Drop staff notices and client-program emails by pattern (`Program ends today:`, `Check-in due`, `Resources for <name>`, weekly program titles…).
3. For each remaining subject, read the tags of up to 30 recipients (`GET /contacts/{id}`) and look at the most common sequence tags. **Tags reflect today, not when the email was sent**, so trust recent months and use structure for older ones (for example, a ~5,000-recipient batch sent every Mon/Wed/Fri was obviously the long nurture sequence).
4. Normalise personalised subjects ("You still with me Tania?" → "You still with me?", "Chapter 3 of 5: …" → "Chapter 3 of 5").
5. Write the result as a fixed list in `EMAIL_SEQUENCES`; anything unknown shows as "Other emails" so nothing disappears. Re-check "Other emails" every few weeks.

## 3. Calendly bookings

- Events: `GET https://api.calendly.com/scheduled_events?organization=<ORG>&min_start_time=…&max_start_time=…&count=100` (follow `pagination.next_page`). Filter by event name containing the sales-call name.
- Invitees: `GET <event uri>/invitees` → `created_at` (booking date), `status`, `no_show`, `rescheduled`, `email`, `name`, `tracking.utm_source`.
- "Booked from email" = `tracking.utm_source == 'email'` or the event name contains "Email" (a dedicated email booking page). UTM only arrives if the email links carry it: turn on GHL's UTM tracking on the email or add `utm_source=email` to the link, and pass it through any form in between (for example a Typeform hidden field forwarded to the Calendly redirect). Test with one real booking.
- Count bookings by `created_at` month (not call date), and skip the old half of a reschedule (`rescheduled: true`).
- The org-wide Calendly listing needs an org-level token; a personal token can return 403.

## 4. The email behind each booking

For each email booking: `GET /conversations/search?locationId=…&query=<invitee email>` → the conversation whose `email` matches → `GET /conversations/{id}/messages?type=TYPE_EMAIL&limit=40` → the last 4 outbound marketing emails before `created_at` → their status → pick the newest **clicked**, else newest opened, else newest sent. Cache the answer 6 h.

## 5. Sales sheet and revenue

- One tab per month ("November 2026", "Nov 26"…). Find columns by header name in the first 5 rows (`findCols_`: closer, date of sale, sale, cash, client, setter, offer) so older tabs with other layouts still load.
- Revenue from email = sales this month whose client name (normalised: lower case, letters and spaces only) matches someone who booked from email this or last month. Also show it as a share of all revenue.

## 6. Slack setter posts

`conversations.history` on the booked-calls channel with the bot token, count posts per setter per day (`setterFor_` maps user IDs to setter names). Paginate; respect rate limits.

## 7. Checking the numbers

Before launch, prove the numbers to yourself and to the person:
- Check every email's status for 1-2 recent days and compare with what the dashboard shows (open rate, click rate, per sequence).
- Compare with any earlier audit or GHL's own workflow statistics (rates should be in the same range).
- Spot-check bookings against Calendly and sales against the sheet.
- Run the same export twice to make sure it's consistent.

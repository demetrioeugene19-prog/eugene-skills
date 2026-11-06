# Launch

## GHL page embed (live write, get an OK first)

Create a funnel/website page (for example `connect.<client domain>/email-dashboard-page`), add a Custom HTML/Code element full width with no padding, and paste:

```html
<iframe src="<Web app URL>" style="position:fixed;inset:0;width:100%;height:100%;border:0" allow="clipboard-write" title="Email dashboard"></iframe>
```

Publish, then check on desktop and phone that the login works inside GHL (the web app must allow framing: `setXFrameOptionsMode(ALLOWALL)`).

## Final checklist

- Background trigger running (Apps Script → Executions shows `emailSync` / `warmCache` every 10 min, Completed).
- Current month fully checked up to 3 days ago; last month filled in (no "still loading").
- Numbers spot-checked against the sources (see data-sources.md §7).
- Login: wrong password message, right password, log out, log back in.
- Phone: no sideways scroll, tabs reachable, login card visible above the keyboard.
- Anything that will look surprising explained in the launch message (for example, a big drop vs last month caused by a one-off batch).

## Launch message (short, from the agency contact)

> Hey <client>, the email dashboard is live: <link>. It's the same password as the sales dashboard. It shows emails sent, opens and clicks for every sequence, the calls booked from email with the email that brought each one in, and the revenue from those calls. It updates on its own every 10 minutes.

Explain it to the person underneath: what each line means and what to check before sending.

## Spreading progress across EODs

The team writes an end-of-day update for the client. When a build is faster than the agreed launch date, plan one honest slice per day (data connected → main page → bookings + revenue + testing → launch) and keep each EOD to that day's slice, even if the build is ahead. Keep the full status in the internal log.

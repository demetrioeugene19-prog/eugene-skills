# Design system (the "sales dashboard" look)

Use this look by default; it's what the client approved and it makes a family of dashboards feel like one product. Copy the CSS from `assets/email-dashboard/Index.html` rather than rewriting it.

## Colors and type

```css
:root{--bg:#0b0f0e;--side:#090c0b;--panel:#111614;--stroke:#ffffff12;--text:#ecebe8;--muted:#a3aca9;--faint:#848e8b;
  --rose:#d6938a;--mint:#8fb8a6;--sand:#e9e0d8;--blush:#f4dbd0;--gold:#e8c792;--teal:#6fa89a;--red:#dc9589}
```

- Font: Inter everywhere (400-700). Numbers: Inter 600, `letter-spacing:-.02em`, `font-variant-numeric:tabular-nums`. The rose italic "&" in titles is Playfair Display italic.
- Background: near-black with two slow drifting glows (rose top-left, mint bottom-right, 26 s / 32 s), switched off for reduced motion.
- Cards: `#111614`, 1px `#ffffff12` border, 12px radius, 18px padding.
- Positive change pills mint (`#8fb8a62e` bg), negative rose-red (`#dc95892e`), "same" grey.
- For a different brand, swap the rose/mint pair and the logo; keep the dark neutrals.

## Layout

- **Sidebar (232px, sticky):** client wordmark image, "EMAIL **DASHBOARD ↗**" (second word rose), "YOUR SPACE" caption, menu buttons with 18px line icons (active = rose text on `#d6938a1f`), and at the bottom a "<MONTH> PERFORMANCE" note with a one-line tagline and a thin rose line showing how far the month is.
- **Header:** overline "CLIENT NAME • NOVEMBER 2026" plus a rose pill "LIVE … DASHBOARD"; h1 30px 600 ("Emails & Bookings"); a one-sentence intro in muted 14px; a green "Updated Nov 5, 7:37 AM ET" pill with a pulsing dot.
- **Toolbar row** under the header, between hairlines: the month in 15px bold caps on the left, the tab switcher on the right.
- **Each tab:** a 22px section title, then number chips (circle icon, number, label, change pill), then a month switcher on the right; cards in a grid below.
- **Phone (≤900px):** the sidebar becomes a top bar (logo + Refresh / Log out), tabs scroll sideways, grids become one column, wide boards scroll sideways. Test at 390px: no sideways page scroll.

## Components that worked

Daily stacked bars (sent sand, opened rose, clicked mint; days not checked yet drawn dashed as "still being opened"; hover shows the day), a donut ("Calls booked by sequence"), a funnel (sent → opened → clicked → booked → became a client), a revenue card, latest-bookings rows with initials avatars, a board of columns (one per sequence) with cards per email and "+ N more", and a searchable/filterable card grid (sort by booked / clicks / opens).

## Motion

- Tab switch: content blurs in (`blur 14px → 0`, 0.6 s), cards rise one after another (60 ms stagger), numbers count up from 0 (1 s ease-out), bars grow, donut draws.
- After login: hide the dashboard (`.app.pre{opacity:0}`) while the login shows, then play the whole entrance once it's visible (header/toolbar blur in, sidebar slides in, then the tab entrance). Otherwise the animations run behind the login and nobody sees them.
- Everything off under `prefers-reduced-motion`.

## Honest numbers

- Show "," (not 0) when a source failed or a month is still loading, with a one-line warning box saying which source and that it retries.
- Say how rates were measured in a small note under the page ("Open and click rates cover emails sent Nov 1 to Nov 2…").
- Names of the client's leads appear only as initials.

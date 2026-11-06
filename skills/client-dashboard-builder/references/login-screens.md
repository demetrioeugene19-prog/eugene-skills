# Login screens

Every login uses the same **house card** (copy it from `assets/login-tunnel.html`): client wordmark, ", EMAIL DASHBOARD ," in rose with fading lines, a greeting by time of day ("Good evening, team"), one sentence of what's inside, a password field with a lock icon and a show/hide eye, a rose gradient "Open dashboard →" button with a shine on hover and a spinner while checking, an error line, and "Private · <client> <team>" with a green dot. Wrong password: the card shakes and shows the server's message.

## Tunnel (current favourite, used on the email dashboard)

`assets/login-tunnel.html` is a standalone preview; the integrated version lives in `assets/email-dashboard/Index.html` (search for "tunnel login"). It's drawn on a 2D canvas, no 3D library, so it loads instantly and runs on phones.

- 0-3 s: fast fly-through that eases into a slow drift (`speed = 0.28 + 5.2·e^(−t/0.85)`), then the card slides in on the right (phone: bottom) and a big tagline fades in top-left ("Every email, *every* reply.").
- The lattice: square frames with an inner 45° square, an octagon "cage" every third frame, all twisting with depth and slowly turning; beams drawn as bars with one bright edge; rails and braces between frames; flickering glints; loose bars flying past; a soft center glow; short motion trails.
- Mouse: the far end leans toward the cursor, and a soft light with a sparkle trail follows it (mouse only).
- Right password: card fades, speed ramps up ("warp"), a rose flash, the login fades and the dashboard entrance plays.
- Rebuild the tunnel every time the login shows (`buildTunnel()` in `start()`); otherwise after a login + log out it starts far ahead and looks tiny.
- Stop the animation loop while the dashboard is showing (battery and speed).
- Rebrand: change `COLS` (RGB triples), the tagline, the wordmark image. Don't copy another studio's exact scene; make an original one in the client's colors.

## Envelope (story version)

A pile of envelopes, the top one sealed with a wax seal; tap → it moves to the middle, the seal breaks, the flap opens in 3D, the letter slides up and is the login; right password → the letter goes back in, the flap closes, the seal stamps, the envelope flies off. Gotchas: keep the letter clipped inside the envelope until it slides out, time the seal and tuck steps in code rather than CSS transitions, and make the floating envelope clickable in tests with `force=True`.

## Lamp (sales dashboard)

A hanging lamp with a pull cord; pull → it flickers on, light fills the room, and the card fades in. Lives in `sales-dashboard/apps-script/build.py` in the the client repo.

## Choosing

Ask which feel they want: premium "wow" (tunnel), a story (envelope), or a playful touch (lamp). Show a standalone preview first, and keep the whole thing under ~3 s with a "Skip intro".

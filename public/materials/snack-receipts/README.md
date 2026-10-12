# Two real snack receipts

Captured on 2026-10-12 with `pnpm snack prove --solution` (the reference proof), one revision apart:

1. `1-fail-attendee-app.json`: the attendee app as shipped (`lab/app/index.html`, revision `d14af25cd65a`). FAIL: the record vanishes on reload.
2. `2-pass-after-agent-fix.json`: after a Claude Code run with the slide 19 prompt edited the app (revision `4e8c43d6bc1e`). PASS. The fixed file is `agent-fixed-index.html`; copy it over `lab/app/index.html` to reproduce that revision.

Screenshot paths are relative to the repo; the PNGs live in the ignored `.lab-runs/` folder and are not committed. The `app` URL's port changes on every `pnpm snack up`.

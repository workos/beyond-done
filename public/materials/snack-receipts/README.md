# Two real snack receipts

Captured on 2026-10-12 with `pnpm snack prove --solution` (the reference proof):

1. `1-fail-attendee-app.json`: the attendee app as shipped (`lab/app/index.html`, revision `d14af25cd65a`). FAIL: the record vanishes on reload.
2. `2-pass-after-agent-fix.json`: after a Claude Code run with the agent-run slide's prompt edited the app (revision `4e8c43d6bc1e`). PASS. The fixed file is `agent-fixed-index.html`; copy it over `lab/app/index.html` to reproduce that revision.
3. `3-pass-console-error-miss.json`: `pnpm snack up --bug console-error` (revision `8d0a01bfdc95`). PASS, with `track is not defined` in `pageErrors`: the game's miss that no check catches.

The deck's receipt slide (`RepairReceipt.vue`) walks through 1 → 2; the take-home receipt history (`ReceiptHistory.vue`) shows all three.

Screenshot paths are relative to the repo; the PNGs live in the ignored `.lab-runs/` folder and are not committed. The `app` URL's port changes on every `pnpm snack up`.

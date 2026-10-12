# Waitlist signup

The sold-out Midnight Snack Lab keeps a waitlist. A visitor submits an email and becomes `waitlisted`. Browser-local only: no real seat, email, or payment.

## Sub-features

- **Join:** the Email field and the Join waitlist button.
- **Request panel:** Request status (`none` or `waitlisted`) and Saved email (`—` when empty).
- **Confirmation:** the status message under the panel.
- **Persistence:** the record is stored in localStorage (key `midnight-snack-waitlist`) and must survive a reload.

## How to get to it (user POV)

Open the app. Type an email into **Email** and press **Join waitlist**. Reload the page: the same status, email, and confirmation are still there.

## Driving it with snack

```bash
pnpm snack reset                 # fresh visitor
pnpm snack join ada@example.test
pnpm snack storage               # was anything saved?
pnpm snack reload
pnpm snack snapshot              # what came back?
pnpm snack prove
```

Handles: label `Email`, button `Join waitlist`, test ids `status` and `email`, role `status` for the confirmation.

## What done means

1. The same email and status come back after a reload.
2. The confirmation says waitlist only: no guaranteed seat.
3. It says the visitor gets an email **if** a place opens.

## Gotchas

- The success message appears whether or not anything was saved. Reload before you believe it.
<!-- Workshop: add the next two. What else looks done here but isn't? -->

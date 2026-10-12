---
title: "Drive the app like an agent"
description: Use snack, a small CLI that drives the waitlist over the Chrome DevTools Protocol, to see exactly what your agent will see.
order: 3
duration: "8 minutes (live 10:00–18:00)"
---

> Live segment **10:00–18:00**. No code edit: you use the lever before you extend it.

## Outcome

You can start the app, check that it's worth driving, reproduce the reload bug with five commands, and point at the JSON that proves it.

## Meet snack

`snack` is a remote control for one app, written for agents first. It's one file, `lab/snack.ts`, and it speaks the **Chrome DevTools Protocol** (CDP): the same connection DevTools uses to inspect a page. Anything you'd check by hand in DevTools, snack can check from a terminal.

| Group | Commands | What they're for |
| --- | --- | --- |
| Health | `up`, `doctor`, `down` | Start the app and a Chrome to drive; is this instance worth driving?; stop it |
| Drive | `join <email>`, `reload`, `reset` | What a user does |
| Look | `snapshot`, `storage`, `console`, `network`, `screenshot`, `eval` | What you'd look at in DevTools |
| Prove | `prove`, `judge` | Run the whole user path and keep a receipt; judge the copy |

`pnpm snack help` lists everything; `pnpm snack help <command>` explains one.

What makes it agent-friendly:

- **JSON out.** Results go to stdout as JSON, so an agent reads fields instead of prose.
- **Errors say what to do next.** Every error includes a `next` line with the command to run instead.
- **`doctor` first.** One read-only check: tools installed, app running, the page showing the current code, the last proof still fresh.
- **`--dry-run` before anything destructive.** `pnpm snack reset --dry-run` shows what it would clear.

## Exercise: reproduce the bug

**Terminal 1** (leave it running):

```bash
pnpm snack up
```

A Chrome window opens on the app. Leave it alone; snack drives it.

**Terminal 2**, one command at a time. Predict the output before each one.

```bash
pnpm snack doctor
pnpm snack join ada@example.test
pnpm snack storage
pnpm snack reload
pnpm snack snapshot
```

## Expected observation

- `doctor` reports `"ok": true` and `build: page shows the current source`.
- `join` returns `"status": "waitlisted"`, Ada's email, and a confirmation.
- `storage` returns `"localStorage": {}`. **Nothing was saved.**
- After `reload`, `snapshot` shows `"status": "none"` and an empty confirmation.

That's the bug, named with evidence, without opening DevTools: the page said “waitlisted” and storage never heard about it.

## Try the rest

- `pnpm snack console` shows console output and page loads since `up` started.
- `pnpm snack screenshot` saves a full-page screenshot and prints its path.
- `pnpm snack up` a second time: read the error. It tells you what to do.

## Catch-up

`doctor` says what's wrong and what to run. If Chromium won't start, pair with a neighbor: reading the JSON together counts.

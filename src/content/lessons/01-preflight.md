---
title: "Preflight — before the hour"
description: Install the tools, check them with snack doctor, and pick the coding agent you'll bring.
order: 1
prework: true
duration: "About 15 minutes before class · not part of the 60"
---

## Arrive ready to experiment

Bring an editor, a terminal, **Node 24**, **pnpm 12.4.1**, and this repository. No Playwright experience is required. Allow roughly 500 MB for Chromium, plus dependencies. Installation happens **before** the 60-minute teaching hour.

Bring the **coding agent you already use**, if you have one: Claude Code, Codex, Cursor, pi, or anything else that can run terminal commands. In lesson 5 you hand it the verifier you build. No agent? Pair with someone, or follow the hosts' run on screen.

## Install and check

The source is [nicknisi/beyond-done](https://github.com/nicknisi/beyond-done). It is currently private: confirm your GitHub account has access before class. A 404 while signed in can mean missing access; ask an instructor before spending time on installation.

```bash
git clone https://github.com/nicknisi/beyond-done.git
cd beyond-done
```

If using mise, review the repository's `mise.toml`, then trust this checkout and install its pinned tools:

```bash
mise trust
mise install
```

Activate mise in your shell as usual, or prefix the commands below with `mise exec --`. If Node 24 and pnpm 12.4.1 are already installed, skip the mise steps.

From the repository root:

```bash
pnpm install
pnpm exec playwright install chromium
pnpm snack doctor
pnpm lab:exercise --solution
```

Linux may require `pnpm exec playwright install --with-deps chromium`; this installs system packages and may request administrator privileges.

**Success:**

- `snack doctor` shows `node` and `chromium` as ok. The `session` check fails with “No app is running.” That's expected: you start the app in class.
- `lab:exercise --solution` runs the reference proof against four versions of the app in a real browser and ends with `prove exercise: PASS`.

## Optional: a Jev key

One slide in lesson 5 asks a small, fast judge model (Jev, from TypeSafe) whether the app's copy is honest. The hosts run it on screen, so you don't need a key. To run it yourself, get a key from [TypeSafe](https://console.typesafe.ai/), copy `.env.example` to `.env`, and fill in `TYPESAFE_API_KEY`. Each `pnpm snack judge` sends the app's fictional confirmation text to TypeSafe and makes one billable request. Keep keys out of screenshots and Git.

## Two different local servers

- `pnpm dev` serves the lessons, glossary, and slides.
- `pnpm snack up` serves the fictional waitlist app and opens a Chrome window that snack can drive. Leave it running in its own terminal; stop it with Ctrl+C.

## If setup is stuck

| Symptom | Next action |
| --- | --- |
| mise says the config is not trusted | Review `mise.toml`, then run `mise trust` in this checkout before `mise install`. |
| Wrong Node/pnpm | Run `mise install` after trusting the config; activate mise in your shell or use `mise exec -- pnpm …`. |
| `chromium` not ok in doctor | `pnpm exec playwright install chromium` (Linux: add `--with-deps`). |
| Download blocked | Use an approved network or pair with someone whose setup works. |
| `lab:exercise` (without `--solution`) fails | Expected until you write the proof in lesson 4. |

After two minutes of setup trouble during class, **pair up**. There is no promised hosted development environment.

## Ready?

Open the next lesson. Your first question isn't “which model?” It's **“what would count as proof?”**

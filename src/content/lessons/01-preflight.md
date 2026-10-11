---
title: "Preflight — before the hour"
description: Install the tools, run a no-key smoke test, and choose your Jev access path.
order: 1
prework: true
duration: "About 15 minutes before class · not part of the 60"
---

## Arrive ready to experiment

Bring an editor and a terminal, **Node 24**, **pnpm 12.4.1**, and this repository. No Playwright or Jev experience is required. Allow roughly 500 MB for Chromium, plus dependencies. Installation is **before** the 60-minute teaching hour.

You do not need a coding-agent subscription. The default worker is scripted; a live generative worker is an after-class extension.

## Install and check

The source is [nicknisi/beyond-done](https://github.com/nicknisi/beyond-done). It is currently private: confirm your GitHub account has access before class. A 404 while signed in can mean missing access; ask an instructor before spending time on installation.

Clone it with Git and your usual GitHub authentication (or use `gh repo clone nicknisi/beyond-done` if you have GitHub CLI):

```bash
git clone https://github.com/nicknisi/beyond-done.git
cd beyond-done
```

If using mise, review the repository's `mise.toml`, then trust this checkout and install its pinned tools:

```bash
mise trust
mise install
mise exec -- node --version
mise exec -- pnpm --version
```

Activate mise in your shell as usual, or prefix the commands below with `mise exec --`. If Node 24 and pnpm 12.4.1 are already installed, skip the mise steps.

From the repository root:

```bash
pnpm install
pnpm exec playwright install chromium
pnpm lab:doctor
pnpm lab:loop --solution
```

Linux may require `pnpm exec playwright install --with-deps chromium`; this installs system packages and may request administrator privileges.

**Success:** doctor prints `PASS: Node, Chromium, and localhost listener`. The loop prints **REPAIR → ACCEPT**, then a `.lab-runs/<id>/report.json` path. It used a scripted worker and synthetic policy scores, not a model.

Doctor reports key presence without testing keys; check `pnpm --version` separately.

## Choose your Jev path

In lesson 4 we test real Jev questions. Either:

- **Run your own:** obtain a key from [TypeSafe](https://console.typesafe.ai/), copy `.env.example` to `.env`, and fill in `TYPESAFE_API_KEY`. Then test:
  ```bash
  pnpm lab:check --scenario happy --solution --judge live
  ```
  This sends fictional task/confirmation text to TypeSafe and makes one billable request. No event-provided credits are assumed. Keep keys out of screenshots and Git. The CLI reads `.env`; existing shell values win.
- **Watch the facilitator:** write the same questions and inspect the live results on screen. No personal key required.
- **Outage fallback:** `pnpm lab:replay` displays actual captured Jev responses, with exact inputs in [the recording](/materials/jev-recording.json). Replay does **not** evaluate your edits.

A live result can differ from the recording. Synthetic policy fixtures and recorded real responses are two different things.

## Two different local servers

- `pnpm dev` → lessons, glossary, and slides.
- `pnpm lab:app --scenario memory-only` → the fictional waitlist app. Use a new private window for a fresh visitor. Stop with Ctrl+C.

Use the URLs printed by the commands; do not assume a port.

## If setup is stuck

| Symptom | Next action |
| --- | --- |
| mise says the config is not trusted | Review `mise.toml`, then run `mise trust` in this checkout before `mise install`. |
| Wrong Node/pnpm | Run `mise install` after trusting the config; activate mise in your shell or use `mise exec -- pnpm …`. Check both versions. |
| Chromium cannot launch on Linux | Install the system dependencies as above. |
| Download blocked | Use an approved network or pair with someone whose setup works. |
| `lab:exercise` fails | Expected until that exercise is implemented; use `--solution` to check the reference. |
| Missing key, timeout, or quota error | Use the facilitator's demo or replay. Do not change the policy to accept. |

After two minutes of setup trouble during class, **pair up**. A checkpoint cannot fix a missing browser, but another working laptop can. There is no promised hosted development environment.

## Ready?

Open the next lesson. Your first question is not “which model?” It is **“what would count as evidence?”**

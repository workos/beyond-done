---
name: workshop
description: Set up and maintain a class from this workshop template. Use when adapting the template to a workshop, writing lessons or slides, generating or reviewing the glossary, configuring attendee features, previewing the site, or deploying it with optional OpenRouter chat.
---

# Workshop

Use the existing scripts to turn the template into a class and maintain it. Do only the sections needed for the user's request; updating a lesson does not imply generating a glossary, creating keys, or deploying.

Read [AGENTS.md](../../../AGENTS.md), [README.md](../../../README.md), and the current configuration before editing. All paths below are repository-root-relative; run commands from that root, three directories above this skill. Inspect the working-tree changes and preserve existing work. Do not introduce a planning/contract workflow unless requested.

## 1. Establish the class

Use the user's brief and existing materials first. Ask only for missing decisions that affect the work: topic and audience, learning outcomes and available time, class identity, and which optional features they want. Do not ask for credentials in chat. A local draft does not need a deployment hostname or model access yet.

1. Use Node 24 and pnpm 12.4.1, or `mise install`.
2. Run `pnpm install` if dependencies need installing, then `pnpm dev`.
3. Edit `class.config.json`, preserving choices outside the request:
   - Set `slug`, `title`, `description`, `event`, and `credit` (the instructor's name).
   - Set `audience` to who the class is for; leave it empty to hide the home-page audience text.
   - Set `links` to an array of `{ "label": "Instructor website", "url": "https://example.com" }` entries for the shared footer, or `[]` for none. Use the user's actual links; HTTP(S), `mailto:`, `/paths`, and `#anchors` are supported. Do not edit page code for these metadata changes.
   - Before deployment, choose a distinct slug and an assigned `<subdomain>.typevoid.com` hostname. The slug is also the Worker name. The schema currently accepts only that domain; do not assume arbitrary hostnames work.
   - Set the theme preset and accent as requested; use the existing presets rather than building a new theme system.
   - Choose `slides.publish` independently from `slides.link`. Published but unlinked slides remain accessible by URL.
   - Configure `features.quiz`, `features.demos`, `features.progress`, and `features.chat` independently. Chat also needs a server-side inference key before its button appears.
4. Update the deck's frontmatter title and opening slide separately; `class.config.json` does not rewrite them.

## 2. Adapt the teaching materials

Replace starter lessons and slides with material matching the audience and outcomes. Prefer a short explanation followed by an exercise with a visible success check. Keep prerequisites, expected results, and resources next to the exercise that needs them. Do not invent workshop logistics or resource URLs.

Lessons live in `src/content/lessons/`. Use Markdown unless a component requires MDX. Follow `src/content.config.ts`; for example:

```markdown
---
title: Inspect the result
description: Check your output against the requirements.
order: 3
duration: 15 minutes
---

## Exercise

Write the task and how students will check the result.
```

Filenames become lesson URLs, so preserve existing filenames unless a URL change is intentional. Lessons sort by `order`, then filename. Every lesson in this collection is published; keep instructor-only material elsewhere. Files in `public/` are also public.

Edit `slides/slides.md` alongside the lessons. Keep imported slide files inside `slides/`. `pnpm dev` serves published slides at `/slides/`; `pnpm slides` starts the separate Slidev presenter. Public builds omit speaker notes, but a public source repository still exposes its files.

The built-in glossary is AI-oriented. For a different subject, inspect `src/core-glossary.ts` and the starter glossary/quiz in `src/class-glossary.ts` rather than assuming generation removes irrelevant defaults. If adapting defaults, keep term IDs and references consistent and check the generator's core-term instructions in `scripts/generate.ts`.

## 3. Generate and review the glossary

Generation is an explicit content operation, not part of dev, build, or deployment. Use it when requested or included in the agreed workshop setup. Before rerunning, inspect any existing `generated/glossary.json` changes and preserve reviewed edits; regeneration replaces the file, including manual edits.

Use an installed, authenticated Pi CLI:

```bash
pnpm glossary
# Optional model override:
pnpm glossary --model provider/model
```

The command reads `slides/slides.md` with resolved imports and the lesson Markdown/MDX under `src/content/lessons/`. It combines generated content with the maintained core terms and writes `generated/glossary.json`. Slides remain a generation source even when publication or linking is disabled. Source material is sent to the selected model provider; do not send confidential instructor material without authorization.

Review the result against the actual lessons and slides:

- Definitions fit what this class teaches; no unrelated filler or duplicated core terms.
- Term references, source paths, and slide numbers are valid. Do not invent slide numbers for lesson-only terms.
- Resources are real source links, and quiz answers are correct.
- The enabled glossary features render and work in the site.

Treat the JSON as reviewable source intended for version control, not disposable build output. Regenerate after relevant source changes when requested, and report when the glossary remains stale. If Pi authentication is unavailable, continue with the starter or existing glossary and say generation was not performed; do not silently substitute another provider. OpenRouter chat credentials are not Pi generation credentials.

## 4. Verify locally

Use the URL printed by `pnpm dev`; do not assume a free port. Check the lesson list, an edited lesson, and `/glossary/`. Check `/slides/` and navigation when publication is enabled. An unlinked published deck must still load directly, while the site omits its links.

Run relevant checks:

```bash
pnpm test
pnpm build
```

`pnpm build` includes typechecking. For a faster type-only check, use `pnpm typecheck`. `pnpm preview` builds and runs the Cloudflare Worker locally to verify the assembled site and API routes.

Chat must stay hidden when `GET /api/chat/status` reports `enabled: false`. For local chat, an inference `OPENROUTER_API_KEY` can be provided through the shell or gitignored `.dev.vars`/`.env`; restart dev after changing credentials. A management key alone does not enable chat. Do not claim an actual model answer was verified if only availability or error handling was tested.

## 5. Deploy and configure chat when requested

Local setup is not authorization to publish or create a key. When deployment is requested, confirm the chosen hostname belongs to this class and use the user's intended Cloudflare account. Do not delete conflicting DNS records or overwrite another workshop to make deployment succeed.

```bash
pnpm deploy
```

The wizard prompts for starter slug/hostname values, saves configuration, typechecks, builds, and deploys using `.class-build/wrangler.json`. It does not regenerate the glossary. Wrangler can handle interactive login; CI needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Do not use the legacy companion's root Wrangler config for this site.

With chat enabled, deployment reuses an installed key or sets one up when credentials are available. To configure only chat on an already-deployed class:

```bash
pnpm chat:setup
```

- Provisioning accepts `OPENROUTER_MANAGEMENT_API_KEY` in the shell or gitignored `.env`; `OPENROUTER_MANAGEMENT_KEY` is a compatibility alias.
- Agree on a lifetime budget and future expiry before creating a key. The interactive defaults are $15 and seven days, not an instruction to spend without approval. Set `CHAT_BUDGET_USD` and `CHAT_EXPIRES_AT` to the agreed values for a non-interactive run.
- An existing local `OPENROUTER_API_KEY` can be installed instead of creating one. `OPENROUTER_MODEL` is optional.
- The script pipes secrets to Cloudflare and stores only a nonsecret receipt at `generated/openrouter-chat-key.json`. Do not print key values, manually persist a returned key, or delete the receipt to force replacement.
- Missing credentials leave chat hidden without blocking deployment. Installing a secret enables runtime availability without a rebuild; it does not install that inference key into the local dev environment.
- Reruns reuse an installed key and recover interrupted setup; failed installation revokes a newly created key. Inspect failures rather than bypassing these protections or creating another key manually. Expired keys need explicit revocation before replacement; see the README.

For bundle verification without publication, run `pnpm build` followed by `pnpm exec wrangler deploy --config .class-build/wrangler.json --dry-run`.

Finish with the changed content/configuration, checks performed, glossary freshness, and any remaining prerequisites. State explicitly whether the site was deployed and whether a key was actually created or installed. Never report a mocked provisioning test as a live deployment.

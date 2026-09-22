# Workshop Companion

Generate an interactive companion from workshop slides and materials. The reusable app lives here, while each workshop keeps its generated glossary, quizzes, resources, demos, and deployment metadata.

The companion includes:

- A built-in AI basics section
- Workshop-specific terms and cross-links
- Search, progress, sharing, quizzes, resources, and fixed interactive demos
- Optional slide links when the source has reliable slide numbers
- Glossary-grounded chat with a per-workshop OpenRouter key

## Start with the wizard

Install and authenticate Pi first. The generator reuses that configured model access.

```bash
pnpm install
pnpm create-companion
```

You may pass the workshop directory to skip the first question:

```bash
pnpm create-companion ../my-workshop
```

The wizard:

1. Detects `.studio.slides.md`, `slides.md`, `deck.md`, or `presentation.md` in the workshop directory.
2. Optionally includes another materials file or directory.
3. Asks for the title, workshop ID, event label, presenter credit, slides URL, color preset, and accent color.
4. Uses a short-lived Pi RPC session to generate and validate the glossary with your existing Pi authentication.
5. Opens a local preview for review.
6. Lets you select the attendee chat model.
7. Asks for attendee count and expected questions per attendee.
8. Fetches current OpenRouter pricing and estimates tokens and cost per attendee from the generated glossary.
9. Adds a 50% buffer and recommends a hard key cap with a minimum of $15.
10. Optionally builds, deploys, and provisions the limited workshop chat key. Before building, asks whether to include slide links if you supplied a slides URL.

## What counts as workshop input

The best primary input is one resolved Markdown slide deck. Slidev's generated `.studio.slides.md` is ideal because it contains the final ordered workshop content and preserves reliable slide numbers.

The generator accepts `.md`, `.mdx`, and `.txt` files. An optional materials directory is read recursively for those formats. It ignores `.git`, `node_modules`, hidden directories, and `dist`.

Example workshop layout:

```text
my-workshop/
  .studio.slides.md
  materials/
    handout.md
    exercises.md
  generated/
    glossary.json
    openrouter-chat-key.json
  dist/
    glossary/
```

`generated/glossary.json` contains the workshop title, theme, terms, quiz, resources, demos, and source references. `generated/openrouter-chat-key.json` is a nonsecret receipt containing only the key hash, cap, and expiry.

## Built-in AI basics

Every glossary starts with the same maintained core terms:

- Artificial intelligence
- Model
- Large language model
- Token
- Prompt
- Context window
- Hallucination
- Grounding
- Agent
- Tool use

The model is told not to duplicate these terms. Workshop-specific terms may link to them and quizzes may reference them.

## Generation with Pi

Local generation runs `pi --mode rpc` in an ephemeral, tool-free session. It uses the model and authentication already configured in Pi, including subscription or OAuth credentials. Set `PI_GENERATION_MODEL` or pass `--model` to override Pi's configured default model.

Pi receives the collected workshop text, returns JSON, and gets one repair attempt if the response fails schema validation. It cannot edit the workshop because all tools, extensions, skills, prompts, and project context are disabled for this subprocess.

## OpenRouter keys

The wizard needs `OPENROUTER_MANAGEMENT_KEY` only when you choose to deploy attendee chat. It creates and revokes limited workshop inference keys. A Management API key cannot call models and is not used by Pi for glossary generation.

If the management key is absent, the wizard asks for it with hidden input. It does not write the key into the workshop.

Create a Management API key at <https://openrouter.ai/settings/management-keys>. Management keys cannot call models.

Each deployed workshop receives its own normal OpenRouter key with:

- A configurable model
- A calculated USD lifetime cap
- `limit_reset: null`, so the budget never replenishes
- An expiry two days after the workshop
- Server-side storage as a Cloudflare Worker secret

A `$100` key cap does not charge `$100`. OpenRouter charges actual usage up to the cap.

Revoke a workshop key after the event:

```bash
pnpm chat-key revoke \
  --receipt ../my-workshop/generated/openrouter-chat-key.json
```

## Manual generation

The wizard is the normal path. The lower-level command remains available:

```bash
pnpm generate \
  ../my-workshop/.studio.slides.md \
  --include ../my-workshop/materials \
  --out ../my-workshop/generated/glossary.json \
  --slug my-workshop \
  --title "My Workshop" \
  --theme-preset paper \
  --accent '#b94724' \
  --slides-url /slides
```

Omit `--model` to use Pi's configured default, or add `--model <provider/model>` for a one-run override.

## Deploy an existing companion

Use mise to run the existing scripts. Generation, deployment, and chat provisioning are separate tasks, so rebuilding or deploying never creates another key.

### Configure once

From this repository:

```bash
mise trust
mise install
pnpm install
cp mise.local.toml.example mise.local.toml
```

Edit `mise.local.toml` with your workshop directory, source file, title, slug, and Worker name. Set `CHAT_EXPIRES_AT` to a real future ISO date, preferably two days after your workshop. The example defaults to a $15 lifetime cap and `anthropic/claude-haiku-4.5`.

Mise inherits your existing `OPENROUTER_MANAGEMENT_KEY`. It also loads `.env` if present. Do not add an empty management-key entry to `.env` if your shell already supplies it. Both `.env` and `mise.local.toml` are gitignored. The management key stays local; only the limited inference key goes to Cloudflare.

### Deploy and enable chat

```bash
pnpm exec wrangler login  # once, if not already authenticated
mise run deploy
mise run chat:setup
```

`deploy` builds the existing `generated/glossary.json` without slide links, then deploys to `WORKER_NAME`. It does not regenerate content. Wrangler prints the public URL. Attach `handoff.typetovoid.com` in the Worker's Cloudflare settings under Domains & Routes if you have not already done so.

`chat:setup` uses your management key to create a capped, expiring inference key. It installs `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` together and verifies that both secret names exist on the Worker. The plaintext key is passed directly to Wrangler, not printed or saved. The nonsecret receipt lives at `<WORKSHOP_DIR>/generated/openrouter-chat-key.json`.

An existing receipt blocks creation of another key. If installation fails, setup attempts to revoke the new key. If verification or revocation fails, the task reports failure; run `mise run chat:revoke` before retrying. Setup archives a revoked receipt on the next run.

The glossary, quizzes, and demos work without chat credentials. Skip `chat:setup` if you do not need chat.

### Update or retire a workshop

```bash
mise run generate     # only when you want fresh content; replaces the glossary
mise run deploy       # rebuild and redeploy; keeps existing chat secrets
mise run chat:revoke  # revoke the workshop key after the event
```

Save manual glossary edits before regenerating. Extra generator flags can be passed through, for example `mise run generate --include ../my-workshop/materials`.

To run from another directory, use `mise -C /absolute/path/to/workshop-glossary run deploy`. Paths in workshop configuration are relative to this repository, not your shell's working directory.

For several workshops, keep separate `mise.handoff.local.toml`, `mise.another.local.toml`, etc. instead of `mise.local.toml`. Select one with `mise -E handoff run deploy` or `mise -E handoff run chat:setup`. Give each workshop a distinct directory and Worker name. Deploy one at a time because builds share `dist`.

### Lower-level commands

The pnpm commands still work without mise:

```bash
pnpm build:workshop ../my-workshop/generated/glossary.json --out ./dist --no-slides
pnpm exec wrangler deploy --name handoff-companion
```

`--no-slides` hides slide links and source-file labels, and removes local-only resources and links into the configured slide deck from the build. It leaves the original glossary unchanged. Omit it to keep slide references. The companion never bundles or hosts the slide deck itself.

## Checks

`mise run check` runs tests and typechecking. Task tests use fake OpenRouter and Wrangler commands and skip if mise is not installed.

```bash
pnpm test
pnpm typecheck
pnpm build
bash -n scripts/create-companion.sh
```

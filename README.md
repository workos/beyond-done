# Workshop Glossary

Generate a glossary companion from workshop slides and materials. The reusable generator lives here. Generated content stays inside each workshop project.

The companion includes:

- A built-in AI basics section
- Workshop-specific terms and cross-links
- Search, progress, sharing, quizzes, resources, and fixed interactive demos
- Slide links when the source has reliable slide numbers
- Glossary-grounded chat with a per-workshop OpenRouter key

## Start with the wizard

Install and authenticate Pi first. The generator reuses that configured model access.

```bash
npm install
npm run create-workshop
```

You may pass the workshop directory to skip the first question:

```bash
npm run create-workshop -- ../my-workshop
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
10. Optionally builds, deploys, and provisions the limited workshop chat key.

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
npm run chat-key -- revoke \
  --receipt ../my-workshop/generated/openrouter-chat-key.json
```

## Manual generation

The wizard is the normal path. The lower-level command remains available:

```bash
npm run generate -- \
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

## Checks

```bash
npm test
npm run typecheck
npm run build
bash -n scripts/create-workshop.sh
```

# Class materials template

An Astro site for teaching a class. Lessons are the main content. A glossary, Slidev deck, and optional interactive tools support them.

## Start a class

Create a repository from this template, then:

```bash
pnpm install
pnpm dev
```

Use Node 24 and pnpm 12.4.1, or run `mise install` for the versions in `mise.toml`. The starter runs without model credentials or a Cloudflare account.

Edit `class.config.json`:

- Set `slug`, `title`, `description`, `event`, and `credit` for your class.
- Set `hostname` to your chosen subdomain, such as `agents.typevoid.com`.
- Adjust `theme.preset` and `theme.accent`. The existing paper design is the default; clean and contrast palettes are also available.
- Set `slides.publish` to publish the deck. It defaults to `false`.
- Enable any of `features.quiz`, `features.demos`, `features.progress`, and `features.chat`. They default to `false`.

Use a distinct slug and hostname for each class. The slug is also the Cloudflare Worker name. Deployment refuses the starter values `my-class` and `my-class.typevoid.com`.

Quiz questions, demos, and chat appear in the glossary. Progress adds lesson-completion buttons and learned-term tracking, saved in the student's browser without an account.

## Write lessons

Lessons live in `src/content/lessons/`. Both Markdown and MDX work:

```markdown
---
title: Your lesson
description: What students will practice.
order: 3
duration: 20 minutes
---

## Exercise

Write the instructions here.

## Resources

Add links next to the exercise that uses them.
```

The filename becomes the URL. `03-your-lesson.md` becomes `/lessons/03-your-lesson/`. Lessons sort by `order`, then filename. Each page has previous and next links. Use MDX when a lesson needs a component; ordinary lessons can stay Markdown.

All files in this collection are published. Keep instructor-only material outside it. Put public downloads in `public/`, never private slides or credentials. Customize the shared layout in `src/layouts/ClassLayout.astro` and the design in `src/styles.css` and `src/class.css`.

## Work on slides

Edit `slides/slides.md`, including its title. Run the presenter separately:

```bash
pnpm slides
```

The Slidev title and content belong to the deck; changing the class title does not rewrite them.

With `slides.publish: true`, the class build includes the deck at `/slides/` and adds navigation and glossary slide links. Slide links use hash routing so they work on Cloudflare static assets. Public builds omit speaker notes.

With `slides.publish: false`, the build includes no deck output or slide navigation. The published glossary removes slide numbers, source-path metadata, and resources linking to the deck. Glossary generation still reads the slides. This hides the deck, not the concepts derived from it. A public GitHub repository also exposes slide source regardless of this setting.

`pnpm dev` previews lesson and glossary edits. Use `pnpm slides` while editing the deck, or `pnpm preview` to test the assembled site, including published slides and the chat Worker.

## Generate the glossary

The starter shows the maintained terms in `src/core-glossary.ts`. It needs no AI call to build. Edit that file to change the defaults; keep term IDs unique and update references when removing terms.

Install Pi and authenticate with your chosen model, then run:

```bash
pnpm glossary
# Optional model override:
pnpm glossary --model provider/model
```

This reads the resolved Slidev deck and all lesson Markdown/MDX, combines generated terms with the defaults, and writes `generated/glossary.json`. Slidev imports, slide frontmatter, and hidden slides are resolved before assigning slide numbers. Imported decks must stay inside `slides/`.

Review and commit the JSON. Run generation again when lessons, slides, or default terms change. Generation replaces the JSON, including manual edits, so commit edits before regenerating. It uses a tool-free Pi RPC session with your existing Pi authentication. Source text is sent to that model provider. One schema-repair attempt is allowed; failed validation leaves the previous file intact.

Build and deploy never invoke the model or overwrite the reviewed glossary. Until `generated/glossary.json` exists, the site uses the starter defaults and a sample quiz. Invalid generated JSON fails the build instead of silently falling back.

## Deploy to Cloudflare

The `typevoid.com` zone must be active in the Cloudflare account you use. Authenticate once:

```bash
pnpm exec wrangler login
```

Then deploy the hostname configured in `class.config.json`:

```bash
pnpm deploy
```

The command builds Astro, optionally builds Slidev, and deploys a Worker with static assets and a Custom Domain route for exactly that hostname. Cloudflare manages the hostname's DNS record and certificate. Existing conflicting DNS records may need to be removed or migrated first. This command changes Cloudflare resources; use a hostname assigned to this class.

For CI, supply `CLOUDFLARE_API_TOKEN` with Workers deployment and zone permissions, plus `CLOUDFLARE_ACCOUNT_ID`. Do not commit credentials.

To check the deployment bundle without publishing:

```bash
pnpm build
pnpm exec wrangler deploy --config .class-build/wrangler.json --dry-run
```

`.class-build/wrangler.json` is generated from class configuration. Do not edit or commit it. Use `pnpm deploy` for the class site; the root `wrangler.jsonc` remains for the older standalone companion commands.

## Optional attendee chat

Set `features.chat` to `true` and deploy. Chat stays grounded in the published glossary. It requires server-side `OPENROUTER_API_KEY` and optionally `OPENROUTER_MODEL` secrets:

```bash
pnpm exec wrangler secret put OPENROUTER_API_KEY --config .class-build/wrangler.json
pnpm exec wrangler secret put OPENROUTER_MODEL --config .class-build/wrangler.json
```

Use a capped, expiring inference key for each class. The existing provisioning tools can create one:

```bash
cp mise.local.toml.example mise.local.toml
# Set a future CHAT_EXPIRES_AT and your budget in mise.local.toml.
# Set OPENROUTER_MANAGEMENT_KEY in your environment or gitignored .env.
mise run chat:setup
# After the class:
mise run chat:revoke
```

The class defaults to the current directory and its configured slug for key provisioning. If migrating this working copy from the old companion setup, remove old `WORKSHOP_DIR` and `WORKER_NAME` overrides from `mise.local.toml` first. Keys are never created by deploy. The nonsecret receipt is stored in `generated/openrouter-chat-key.json` and ignored by Git.

For local chat, copy `.dev.vars.example` to `.dev.vars`, set an inference key, and run `pnpm preview --env-file .dev.vars`. Astro's development server alone does not run the chat Worker. Disabling chat and redeploying blocks `/api/chat` even if old secrets remain; revoke the key separately when retiring it.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Edit class materials with Astro |
| `pnpm slides` | Present or edit slides locally |
| `pnpm glossary` | Regenerate the reviewable glossary |
| `pnpm build` | Check types and build the class site |
| `pnpm preview` | Build and run the local Cloudflare Worker |
| `pnpm deploy` | Build and publish to the configured hostname |
| `pnpm test` | Run unit and enabled/disabled build tests |
| `pnpm typecheck` | Check Astro and TypeScript |

Mise aliases are `mise run dev`, `mise run generate`, `mise run deploy`, and `mise run check`.

The older external-companion workflow is still available through `pnpm create-companion`, `pnpm generate <source> --out <file>`, `pnpm dev:companion <file>`, and `pnpm build:workshop <file> --out <directory>`. Its Mise tasks are now `companion:generate` and `companion:deploy`.

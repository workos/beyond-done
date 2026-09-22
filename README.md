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

- Set `slug`, `title`, `description`, and `event` for your class. `credit` is your name, shown as “Taught by” on the home page and in the footer.
- Set `audience` to who the class is for; it appears below the home-page description. Use `""` to hide it.
- Add `links` as `{ "label": "Instructor website", "url": "https://example.com" }` entries. They appear in the footer on lesson, home, and glossary pages. Use `[]` for no links. URLs can be HTTP(S), `mailto:`, site-relative `/paths`, or `#anchors`.
- Set `hostname` to your chosen subdomain, such as `agents.typevoid.com`.
- Adjust `theme.preset` and `theme.accent`. The `void` preset is the Typed Void house look and the default; `paper`, `clean`, and `contrast` are also available. The accent is the class colour; the Typed Void mark keeps its own purple.
- Set `slides.publish` to include the deck at `/slides/`. It defaults to `true`.
- Set `slides.link` to show slide navigation and glossary links. Set it to `false` to keep the deck accessible only by URL; this is not access control.
- Chat is enabled by default. `features.quiz`, `features.demos`, and `features.progress` default to `false`. Each feature can be toggled independently.

For example, update these fields in the existing JSON, keeping the other settings:

```json
{
  "title": "Practical TypeScript",
  "description": "Build confidence working with TypeScript in real projects.",
  "audience": "JavaScript developers who are new to TypeScript.",
  "credit": "Your name",
  "links": [
    { "label": "Instructor website", "url": "https://example.com" },
    { "label": "Contact", "url": "mailto:teacher@example.com" }
  ]
}
```

No page-code edits are needed for these details. Existing configurations without `audience` or `links` still work; both default to empty. Configuration is validated when the site starts or builds.

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

All files in this collection are published. Keep instructor-only material outside it. Put public downloads in `public/`, never private slides or credentials. Customize the shared layout in `src/layouts/ClassLayout.astro` and the design in `src/styles.css` (tokens, fonts, glossary) and `src/class.css` (header, footer, lessons). Fonts are self-hosted from Fontsource packages so the site loads without third-party requests. The Typed Void mark is `src/components/BrandMark.astro`; standalone SVGs and construction notes are in `public/brand/`.

## Work on slides

Edit `slides/slides.md`, including its title. `pnpm dev` serves the deck at `/slides/` alongside lessons and the glossary, with live updates. To run only the presenter:

```bash
pnpm slides
```

The Slidev title and content belong to the deck; changing the class title does not rewrite them.

With `slides.publish: true`, development and the class build include the deck at `/slides/`. Navigation and glossary slide links appear only when `slides.link` is also `true`. Slide links use hash routing so they work on Cloudflare static assets. Public builds omit speaker notes.

With `slides.publish: false`, the build includes no deck output or slide navigation. The published glossary removes slide numbers, source-path metadata, and resources linking to the deck. Glossary generation still reads the slides. This hides the deck, not the concepts derived from it. A public GitHub repository also exposes slide source regardless of this setting.

`pnpm dev` previews lessons, glossary, slides, and chat on the same site. Use `pnpm preview` to test the assembled site with the Cloudflare Worker.

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

Run the deploy wizard:

```bash
pnpm deploy
```

The wizard asks for a class slug and hostname if they still have starter values, saves them to `class.config.json`, checks types, builds the site, and deploys its Worker and Custom Domain. With chat enabled, it reuses an installed key or provisions and installs one when credentials are available. Rerunning updates the same site without creating another chat key. Cloudflare manages the hostname's DNS record and certificate. Existing conflicting DNS records may need to be removed or migrated first. This command changes Cloudflare resources; use a hostname assigned to this class.

For CI, configure the class slug and hostname first, then supply `CLOUDFLARE_API_TOKEN` with Workers deployment and zone permissions, plus `CLOUDFLARE_ACCOUNT_ID`. For first-time key provisioning, also set `CHAT_BUDGET_USD` and a future `CHAT_EXPIRES_AT` to avoid interactive prompts. Do not commit credentials.

To check the deployment bundle without publishing:

```bash
pnpm build
pnpm exec wrangler deploy --config .class-build/wrangler.json --dry-run
```

`.class-build/wrangler.json` is generated from class configuration. Do not edit or commit it. Use `pnpm deploy` for the class site; the root `wrangler.jsonc` remains for the older standalone companion commands.

## Optional attendee chat

Chat appears only when `features.chat` is `true` **and** the server has an `OPENROUTER_API_KEY`. Without a key, the button stays hidden. Availability is checked at runtime, so installing a secret does not require rebuilding the site.

Set `OPENROUTER_MANAGEMENT_API_KEY` in your shell or gitignored `.env`. The older `OPENROUTER_MANAGEMENT_KEY` name also works. Then run `pnpm deploy`, or configure chat on an already-deployed class:

```bash
pnpm chat:setup
```

If the Worker already has a key, the script keeps it. Otherwise it asks for a lifetime budget and expiry (defaults: $15 and seven days), creates a capped OpenRouter key, and pipes it directly into Cloudflare secrets. Set `CHAT_BUDGET_USD` and `CHAT_EXPIRES_AT` to supply these values without prompts. An existing local `OPENROUTER_API_KEY` can be installed instead of creating one. `OPENROUTER_MODEL` is optional.

The key itself is never written to disk or printed. A nonsecret receipt is saved to `generated/openrouter-chat-key.json`, ignored by Git. Failed installation revokes the newly created key; rerunning recovers interrupted setup. Missing management credentials leave chat unconfigured without preventing deployment. Expired keys require explicit revocation before replacement:

```bash
pnpm chat-key revoke --receipt generated/openrouter-chat-key.json
pnpm chat:setup
```

For local chat, copy `.dev.vars.example` to `.dev.vars`, set an inference key, and run `pnpm dev`. Development reads `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` from `.env`, `.dev.vars`, or the shell environment (the shell takes precedence). Restart after changing credentials. Without an inference key, chat stays hidden; a management key alone cannot answer questions. To test the Cloudflare Worker instead, run `pnpm preview --env-file .dev.vars`. Disabling chat and redeploying blocks `/api/chat` even if old secrets remain; revoke the key separately when retiring it.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Edit lessons, glossary, and slides; use local chat |
| `pnpm slides` | Present or edit slides locally |
| `pnpm glossary` | Regenerate the reviewable glossary |
| `pnpm build` | Check types and build the class site |
| `pnpm preview` | Build and run the local Cloudflare Worker |
| `pnpm deploy` | Idempotent site deployment and chat setup wizard |
| `pnpm chat:setup` | Create/install a chat key, or reuse the deployed one |
| `pnpm test` | Run unit and enabled/disabled build tests |
| `pnpm typecheck` | Check Astro and TypeScript |

Mise aliases are `mise run dev`, `mise run generate`, `mise run deploy`, and `mise run check`.

The older external-companion workflow is still available through `pnpm create-companion`, `pnpm generate <source> --out <file>`, `pnpm dev:companion <file>`, and `pnpm build:workshop <file> --out <directory>`. Its Mise tasks are `companion:generate`, `companion:deploy`, and `companion:chat:setup`.

# Working on this workshop

This is an Astro class site with Markdown/MDX lessons, a React glossary, and a Slidev deck. The Alto app `talks` serves the built site and optional attendee chat, and logs chat questions to D1 (readable signed in at `/chat-log`).

For workshop setup, content changes, glossary generation, or deployment, read the [workshop skill](.agents/skills/workshop/SKILL.md). If your agent does not discover `.agents/skills/`, open that file directly. Follow only the sections relevant to the request; do not require a planning or contract workflow.

## Source of truth

- `class.config.json`: class identity, audience, instructor name (`credit`), footer links, hostname, theme, slide publication/linking, and feature flags. Schema: `src/class-config.ts`.
- `src/content/lessons/`: published lessons. Frontmatter schema: `src/content.config.ts`.
- `slides/slides.md`: deck entry point; its title is independent of class configuration.
- `src/core-glossary.ts`: maintained starter terms. `generated/glossary.json`: reviewed generated content, intentionally committed.
- `src/layouts/ClassLayout.astro`, `src/class.css`, `src/styles.css`: shared layout and styling.
- `scripts/`: existing generation, development, build, deployment, and key-provisioning commands. Reuse these rather than reimplementing them.
- `README.md`: detailed setup, configuration, and operational reference.

## Commands

Use Node 24 and pnpm 12.4.1 (`mise install` installs the pinned tools). Run commands from the repository root.

- `pnpm install`, then `pnpm dev`: one local site for lessons, glossary, and published slides.
- `pnpm glossary`: explicitly regenerate from lessons and slides using authenticated Pi.
- `pnpm test`: regression tests. `pnpm typecheck`: Astro and TypeScript checks.
- `pnpm build`: typecheck and build. `pnpm preview`: build and run the local Cloudflare Worker.
- `pnpm run deploy:talks`: build and publish to the Alto `talks` app (`deploy:talks:dry-run` stages without publishing). `pnpm chat:setup`: install the chat key on the deployed app.

## Constraints

- Preserve unrelated and uncommitted work. Prefer content/config changes over new application code or dependencies.
- All lessons and files in `public/` are public. `slides.link: false` hides links, not the deck; `slides.publish: false` excludes deck output, not concepts used in glossary generation.
- Generation sends source material to the configured Pi model and replaces `generated/glossary.json`. Preserve reviewed edits before regenerating. Build and deployment must not regenerate it implicitly.
- Glossary generation uses Pi authentication. Chat uses an OpenRouter inference key; a management key is only for provisioning. Chat stays hidden without an inference key.
- Do not print, commit, or put credentials in client code. Deployment and provisioning change remote resources and may create a billable key; run them only within the user's requested scope, using the agreed hostname, budget, and expiry.
- Do not hand-edit `dist/`, `.astro/`, `.talks-build/`, or generated Slidev cache files. Deploy the class through `deploy:talks`, not the legacy companion's root `wrangler.jsonc`.
- Run relevant checks and inspect affected pages. Report what passed, what was not verified, and whether anything was actually deployed or provisioned.

## The waitlist lab app

To change, debug, or verify the attendee app in `lab/app/`, follow [lab/verify/SKILL.md](lab/verify/SKILL.md). It drives the app with `pnpm snack` and defines what counts as proof.

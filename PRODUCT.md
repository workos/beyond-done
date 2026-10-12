# Beyond Done workshop

## Register

product

## Users

JS/TS developers at AIE, working on laptops in a conference room while following a projected demonstration. No previous Playwright or Jev experience is required. Most bring a coding agent (Claude Code, Codex, Cursor, pi).

## Product Purpose

Teach agents to verify their own work in 60 minutes, led jointly by Nick Nisi and Zack Proser. Attendees use an app-specific verification CLI (`pnpm snack`), write the proof that defines “done,” hand both to their own agent, and leave with a plan for the same lever in their own app.

## Brand Personality

Practical, playful, precise. Use WorkOS logo and branding, explicitly requested by Nick Nisi. The workshop site is reference material, not a marketing campaign.

## Anti-references

Do not retain Typed Void as the workshop identity. No fake model measurements or dashboards that obscure the one editable proof. The projected deck should be playful and visually expressive, with meaningful motion—not documentation pasted onto slides. See DESIGN.md.

## Design Principles

- One shared task throughout: a browser-local waitlist for a sold-out workshop.
- Distinguish observed facts (`prove`), semantic judgment (`judge`), and the stop rule.
- Evidence belongs to one revision; “can't tell” is never a pass.
- Show a useful next action, including checkpoints for attendees who fall behind.
- Make recorded runs and live calls unmistakable.

## Accessibility & Inclusion

Use semantic links, labelled form controls, visible keyboard focus, readable contrast, responsive text, and no motion-dependent content. Keep preflight outside the teaching hour, support pair work and a no-key path. No specific certification is claimed.

## User-facing checks

- Attendee can find the preflight, sequential lessons, glossary, slides and take-home worksheet.
- A new visitor can submit a test email in the local lab; the reference app preserves the email, status, and confirmation across reload.
- The shipped attendee app visibly loses the record on reload.
- Every `snack` error tells the reader what to run next.

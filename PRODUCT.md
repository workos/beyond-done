# Beyond Done workshop

## Register

product

## Users

JS/TS developers at AIE, working on laptops in a conference room while following a projected demonstration. No previous Playwright or Jev experience is required.

## Product Purpose

Teach a practical verification and bounded repair loop in 60 minutes, led jointly by Nick Nisi and Zack Proser. Attendees leave with working code, adversarial cases, and a method for deciding when to accept, repair, or ask a human.

## Brand Personality

Practical, playful, precise. Use WorkOS logo and branding, explicitly requested by Nick Nisi. The workshop site is reference material, not a marketing campaign.

## Anti-references

Do not retain Typed Void as the workshop identity. No fake model measurements or dashboards that obscure the three editable functions. The projected deck should be playful and visually expressive, with meaningful motion—not documentation pasted onto slides. See DESIGN.md.

## Design Principles

- One shared task throughout: a browser-local waitlist for a sold-out workshop.
- Distinguish observed facts, semantic inference, and policy.
- Show a useful next action, including checkpoints for attendees who fall behind.
- Make synthetic fixtures and real API calls unmistakable.

## Accessibility & Inclusion

Use semantic links, labelled form controls, visible keyboard focus, readable contrast, responsive text, and no motion-dependent content. Keep preflight outside the teaching hour, support pair work and a no-key path. No specific certification is claimed.

## User-facing checks

- Attendee can find the preflight, sequential lessons, glossary, slides and take-home worksheet.
- A new visitor can submit a test email in the local lab; the correct candidate preserves the email/status and confirmation across reload.
- The memory-only defect visibly loses enrollment on reload.
- Worker text is rendered as plain text, never executable HTML.

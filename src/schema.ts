import { z } from "zod";

export const idSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const themePresetSchema = z.enum(["void", "paper", "clean", "contrast"]);
export const glossaryThemeSchema = z.object({
  preset: themePresetSchema,
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});
export const demoKindSchema = z.enum([
  "none",
  "agent-loop",
  "context-window",
  "tool-use",
  "verification-gate",
  "fan-out",
]);

export const glossaryTermSchema = z.object({
  id: idSchema,
  term: z.string().min(1),
  definition: z.string().min(1),
  whyItMatters: z.string().min(1),
  hear: z.string(),
  aliases: z.array(z.string().min(1)),
  relatedTermIds: z.array(idSchema),
  demo: demoKindSchema,
  sourcePath: z.string().min(1),
  slide: z.number().int().positive().nullable(),
});

export const glossarySectionSchema = z.object({
  id: idSchema,
  level: z.string().min(1),
  name: z.string().min(1),
  intro: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "advanced"]),
  terms: z.array(glossaryTermSchema).min(1),
});

export const glossaryResourceSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  url: z.string(),
  sourcePath: z.string().min(1),
  termIds: z.array(idSchema),
});

export const glossaryQuizQuestionSchema = z.object({
  id: idSchema,
  question: z.string().min(1),
  choices: z.array(z.string().min(1)).length(4),
  answerIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(1),
  termIds: z.array(idSchema).min(1),
});

export const generatedContentSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  event: z.string(),
  credit: z.string(),
  sections: z.array(glossarySectionSchema).min(1),
  resources: z.array(glossaryResourceSchema),
  quiz: z.array(glossaryQuizQuestionSchema).min(1),
});

export const workshopGlossarySchema = generatedContentSchema
  .extend({
    schemaVersion: z.literal(1),
    slug: idSchema,
    updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    slidesUrl: z.string(),
    theme: glossaryThemeSchema,
  })
  .superRefine((workshop, ctx) => {
    const sectionIds = new Set<string>();
    for (const section of workshop.sections) {
      if (sectionIds.has(section.id)) ctx.addIssue({ code: "custom", message: `Duplicate section ID "${section.id}".` });
      sectionIds.add(section.id);
    }

    const terms = workshop.sections.flatMap((section) => section.terms);
    const termIds = new Set<string>();
    const duplicateIds = new Set<string>();

    for (const term of terms) {
      if (termIds.has(term.id)) duplicateIds.add(term.id);
      termIds.add(term.id);
    }
    for (const id of duplicateIds) {
      ctx.addIssue({ code: "custom", message: `Duplicate term ID "${id}".` });
    }

    for (const term of terms) {
      for (const relatedId of term.relatedTermIds) {
        if (!termIds.has(relatedId)) {
          ctx.addIssue({
            code: "custom",
            message: `Term "${term.id}" references unknown term "${relatedId}".`,
          });
        }
      }
    }
    for (const resource of workshop.resources) {
      for (const termId of resource.termIds) {
        if (!termIds.has(termId)) {
          ctx.addIssue({
            code: "custom",
            message: `Resource "${resource.id}" references unknown term "${termId}".`,
          });
        }
      }
    }
    for (const question of workshop.quiz) {
      for (const termId of question.termIds) {
        if (!termIds.has(termId)) {
          ctx.addIssue({
            code: "custom",
            message: `Quiz question "${question.id}" references unknown term "${termId}".`,
          });
        }
      }
    }
  });

export type GeneratedContent = z.infer<typeof generatedContentSchema>;
export type WorkshopGlossary = z.infer<typeof workshopGlossarySchema>;
export type GlossarySection = z.infer<typeof glossarySectionSchema>;
export type GlossaryTerm = z.infer<typeof glossaryTermSchema>;
export type DemoKind = z.infer<typeof demoKindSchema>;
export type ThemePreset = z.infer<typeof themePresetSchema>;

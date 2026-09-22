import { defineCollection } from "astro:content";
import { z } from "zod";
import { glob } from "astro/loaders";

const lessons = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/lessons" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().int().positive(),
    duration: z.string().optional(),
  }),
});

export const collections = { lessons };

import { z } from "zod";
import config from "../class.config.json";
import { glossaryThemeSchema, idSchema } from "./schema.js";

export const classConfigSchema = z.object({
  slug: idSchema.max(63),
  title: z.string().min(1),
  description: z.string().min(1),
  audience: z.string().trim().default(""),
  event: z.string(),
  credit: z.string(),
  links: z.array(z.object({
    label: z.string().trim().min(1),
    url: z.string().trim().pipe(z.union([
      z.url({ protocol: /^https?$/ }),
      z.string().regex(/^mailto:\S+$/),
      z.string().regex(/^(?:\/(?!\/)|#)[^\s\\]*$/),
    ])),
  }).strict()).default([]),
  hostname: z.string().max(253).regex(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/, "Use a bare hostname such as talks.workos.cloud, without https://, a port or a path."),
  // Where the class is served on that host. Every site, deck and glossary URL is resolved against it.
  basePath: z.string().regex(/^(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)+$/, "Use a path such as /beyond-done: a leading slash, no trailing slash, lowercase letters, digits and hyphens."),
  theme: glossaryThemeSchema,
  slides: z.object({ publish: z.boolean(), link: z.boolean().default(true) }).strict(),
  features: z.object({ quiz: z.boolean(), demos: z.boolean(), progress: z.boolean(), chat: z.boolean() }).strict(),
}).strict();

export type ClassConfig = z.infer<typeof classConfigSchema>;
export type ClassFeatures = ClassConfig["features"];
export const classConfig = classConfigSchema.parse(config);

/**
 * Resolves a class-root-relative URL ("/glossary/") against the base path ("/beyond-done/glossary/").
 * Absolute, protocol-relative, hash, mailto and relative URLs pass through, as do URLs already under the base.
 */
export function withBase(url: string, basePath = classConfig.basePath): string {
  if (!url.startsWith("/") || url.startsWith("//")) return url;
  const rest = url.slice(basePath.length);
  if (url.startsWith(basePath) && (rest === "" || /^[/?#]/.test(rest))) return url;
  return `${basePath}${url}`;
}

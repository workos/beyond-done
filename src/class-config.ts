import { z } from "zod";
import config from "../class.config.json";
import { glossaryThemeSchema, idSchema } from "./schema.js";

export const classConfigSchema = z.object({
  slug: idSchema.max(63),
  title: z.string().min(1),
  description: z.string().min(1),
  event: z.string(),
  credit: z.string(),
  hostname: z.string().regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.typevoid\.com$/, "Use a subdomain of typevoid.com, without https:// or a path."),
  theme: glossaryThemeSchema,
  slides: z.object({ publish: z.boolean() }).strict(),
  features: z.object({ quiz: z.boolean(), demos: z.boolean(), progress: z.boolean(), chat: z.boolean() }).strict(),
}).strict();

export type ClassConfig = z.infer<typeof classConfigSchema>;
export type ClassFeatures = ClassConfig["features"];
export const classConfig = classConfigSchema.parse(config);

export function cloudflareConfig(config: ClassConfig) {
  return {
    name: config.slug,
    main: "../src/worker.ts",
    compatibility_date: "2025-09-15",
    workers_dev: false,
    preview_urls: false,
    routes: [{ pattern: config.hostname, custom_domain: true }],
    vars: { CHAT_ENABLED: String(config.features.chat) },
    assets: {
      directory: "../dist",
      binding: "ASSETS",
      not_found_handling: "404-page",
      run_worker_first: ["/api/*"],
    },
  };
}

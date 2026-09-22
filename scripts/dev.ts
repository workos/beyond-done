import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createServer } from "vite";
import { workshopGlossarySchema } from "../src/schema.js";

async function main(): Promise<void> {
  const input = process.argv[2];
  if (!input) {
    console.error("Usage: pnpm dev <workshop/glossary.json>");
    process.exit(2);
  }
  const data = resolve(input);
  workshopGlossarySchema.parse(JSON.parse(await readFile(data, "utf8")));
  process.env.WORKSHOP_COMPANION_DATA = data;

  const server = await createServer({ configFile: resolve(import.meta.dirname, "../vite.config.ts") });
  await server.listen();
  server.printUrls();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

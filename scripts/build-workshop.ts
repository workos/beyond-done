import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { build } from "vite";
import { workshopGlossarySchema } from "../src/schema.js";

function usage(): never {
  console.error("Usage: npm run build:workshop -- <workshop/glossary.json> --out <workshop/dist/glossary>");
  process.exit(2);
}

async function main(argv = process.argv.slice(2)): Promise<void> {
  const data = argv[0] ? resolve(argv[0]) : usage();
  const outIndex = argv.indexOf("--out");
  const out = outIndex >= 0 && argv[outIndex + 1] ? resolve(argv[outIndex + 1]) : usage();
  const projectRoot = resolve(import.meta.dirname, "..");

  workshopGlossarySchema.parse(JSON.parse(await readFile(data, "utf8")));
  process.env.WORKSHOP_GLOSSARY_DATA = data;
  await build({
    configFile: resolve(projectRoot, "vite.config.ts"),
    build: { outDir: out, emptyOutDir: true },
  });
  await mkdir(dirname(resolve(out, "glossary.json")), { recursive: true });
  await copyFile(data, resolve(out, "glossary.json"));
  console.log(`Built workshop companion at ${out}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

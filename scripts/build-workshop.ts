import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { build } from "vite";
import { workshopGlossarySchema } from "../src/schema.js";

function usage(): never {
  console.error("Usage: pnpm build:workshop <workshop/glossary.json> --out <workshop/dist/glossary> [--no-slides]");
  process.exit(2);
}

async function main(argv = process.argv.slice(2)): Promise<void> {
  const data = argv[0] ? resolve(argv[0]) : usage();
  const outIndex = argv.indexOf("--out");
  const out = outIndex >= 0 && argv[outIndex + 1] ? resolve(argv[outIndex + 1]) : usage();
  const projectRoot = resolve(import.meta.dirname, "..");

  const workshop = workshopGlossarySchema.parse(JSON.parse(await readFile(data, "utf8")));
  if (argv.includes("--no-slides")) {
    const slidesUrl = workshop.slidesUrl.replace(/\/$/, "");
    workshop.slidesUrl = "";
    workshop.resources = workshop.resources.filter((resource) =>
      resource.url && (!slidesUrl || (resource.url !== slidesUrl && !resource.url.startsWith(`${slidesUrl}/`))),
    );
  }
  process.env.WORKSHOP_COMPANION_DATA = data;
  await build({
    configFile: resolve(projectRoot, "vite.config.ts"),
    build: { outDir: out, emptyOutDir: true },
  });
  await mkdir(dirname(resolve(out, "glossary.json")), { recursive: true });
  await writeFile(resolve(out, "glossary.json"), `${JSON.stringify(workshop, null, 2)}\n`);
  console.log(`Built workshop companion at ${out}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

import { generateSlidesQr } from "./slides-qr.js";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { classConfig, cloudflareConfig, type ClassConfig } from "../src/class-config.js";
import { main as generate } from "./generate.js";

function run(args: string[]): Promise<void> {
  return new Promise((done, reject) => {
    const child = spawn("pnpm", ["exec", ...args], { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code, signal) => code === 0 ? done() : reject(new Error(`${args[0]} failed (${signal ?? code}).`)));
  });
}

export function generationArgs(config: ClassConfig): string[] {
  return [
    "slides/slides.md", "--include", "src/content/lessons",
    "--out", "generated/glossary.json", "--slug", config.slug,
    "--title", config.title,
    ...(config.event ? ["--event", config.event] : []),
    ...(config.credit ? ["--credit", config.credit] : []),
    "--theme-preset", config.theme.preset, "--accent", config.theme.accent,
    // Source availability and publication are independent. The build strips private links.
    // Class-root-relative: prepareClassGlossary resolves it against basePath, so the glossary stays base-agnostic.
    "--slides-url", "/slides/#",
  ];
}

export async function buildClass(): Promise<void> {
  if (classConfig.slides.publish) await generateSlidesQr();
  await run(["astro", "build"]);
  if (classConfig.slides.publish) {
    await run(["slidev", "build", "slides/slides.md", "--base", `${classConfig.basePath}/slides/`, "--router-mode", "hash", "--without-notes", "--out", resolve("dist/slides")]);
  }
  // Only chat:setup reads this; the site itself ships through pnpm run deploy:talks.
  await mkdir(".class-build", { recursive: true });
  await writeFile(".class-build/wrangler.json", `${JSON.stringify(cloudflareConfig(classConfig), null, 2)}\n`);
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);
  switch (command) {
    case "generate":
      await generate([...generationArgs(classConfig), ...args]);
      break;
    case "build":
      await buildClass();
      break;
    default:
      throw new Error("Usage: tsx scripts/class.ts <generate|build>");
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

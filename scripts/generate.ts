import { mkdir, rename, writeFile } from "node:fs/promises";
import { basename, dirname, extname, resolve } from "node:path";
import { z } from "zod";
import { CORE_GLOSSARY_SECTION, CORE_TERM_IDS } from "../src/core-glossary.js";
import { generatedContentSchema, themePresetSchema, workshopGlossarySchema, type GeneratedContent, type ThemePreset } from "../src/schema.js";
import { withPiRpc } from "./pi-rpc.js";
import { collectWorkshopSource, type CollectedSource } from "./source.js";

interface Options {
  input: string;
  includes: string[];
  out: string;
  slug: string;
  slidesUrl: string;
  title?: string;
  event?: string;
  credit?: string;
  model?: string;
  themePreset: ThemePreset;
  accent: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function usage(): never {
  console.error("Usage: pnpm generate <file-or-folder> --out <workshop/glossary.json> [--include <file-or-folder>] [--slug <id>] [--slides-url <url>] [--title <title>] [--event <label>] [--credit <name>] [--model <pi-model>] [--theme-preset <void|paper|clean|contrast>] [--accent <#rrggbb>]");
  process.exit(2);
}

const DEFAULT_ACCENTS: Record<ThemePreset, string> = {
  void: "#724bb7",
  paper: "#b94724",
  clean: "#315f8c",
  contrast: "#6d28d9",
};

function parseArgs(argv: string[]): Options {
  const input = argv[0];
  if (!input || input.startsWith("--")) usage();

  const values = new Map<string, string>();
  const includes: string[] = [];
  const allowed = new Set(["--out", "--include", "--slug", "--slides-url", "--title", "--event", "--credit", "--model", "--theme-preset", "--accent"]);
  for (let index = 1; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!allowed.has(key) || !value || value.startsWith("--")) usage();
    if (key === "--include") includes.push(value);
    else values.set(key, value);
  }

  const out = values.get("--out");
  if (!out) usage();
  const inferredSlug = slugify(basename(input, extname(input)));
  const slug = values.get("--slug") ?? inferredSlug;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid slug: ${slug}`);
  const themePreset = themePresetSchema.parse(values.get("--theme-preset") ?? "paper");
  const accent = values.get("--accent") ?? DEFAULT_ACCENTS[themePreset];
  if (!/^#[0-9a-fA-F]{6}$/.test(accent)) throw new Error(`Invalid accent color: ${accent}`);

  return {
    input,
    includes,
    out: resolve(out),
    slug,
    slidesUrl: values.get("--slides-url") ?? "",
    title: values.get("--title"),
    event: values.get("--event"),
    credit: values.get("--credit"),
    model: values.get("--model") ?? process.env.PI_GENERATION_MODEL ?? undefined,
    themePreset,
    accent,
  };
}

function systemPrompt(source: CollectedSource): string {
  const coreTerms = CORE_GLOSSARY_SECTION.terms.map((term) => `- ${term.id}: ${term.term} — ${term.definition}`).join("\n");
  const slideRule = source.slideSourcePath
    ? `Only terms sourced from "${source.slideSourcePath}" may set slide to a matching [SLIDE N] number. Every other term must set slide to null.`
    : "Set slide to null because the source does not provide reliable global slide numbers.";
  return `You turn workshop class content into a concise glossary companion.

The app automatically adds these core AI terms. Do not generate them again. Workshop terms may reference these IDs in relatedTermIds, and quiz questions may reference them in termIds:
${coreTerms}

Follow these rules:
- Extract terms that the workshop teaches or relies on. Do not pad the glossary with generic adjacent concepts.
- Organize terms into 3-6 progressive sections from foundational to advanced.
- Write for an attendee who is new to the subject. Use plain, direct language.
- Each definition must explain the concept in workshop context. whyItMatters must say what the attendee can do or understand with it.
- "hear" is an optional phrase an attendee might hear. Use an empty string when it adds nothing.
- relatedTermIds must contain only IDs present in this response or the built-in list above. Never self-reference.
- Pick a demo only when one of the allowed demo kinds accurately explains the term. Otherwise use "none".
- Resources must come from URLs or named materials in the source. Never invent a URL. Use an empty URL for a local source file.
- Quiz questions must test understanding, not trivia. Provide exactly four plausible choices and one correct answer.
- sourcePath must exactly match a SOURCE marker. ${slideRule}
- Return only data matching the supplied JSON schema.`;
}

export function parseGeneratedContent(text: string): GeneratedContent {
  const unfenced = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const firstBrace = unfenced.indexOf("{");
  const lastBrace = unfenced.lastIndexOf("}");
  const json = firstBrace === -1 || lastBrace < firstBrace ? unfenced : unfenced.slice(firstBrace, lastBrace + 1);
  return generatedContentSchema.parse(JSON.parse(json));
}

async function requestGlossary(options: Options, source: CollectedSource): Promise<GeneratedContent> {
  const schema = z.toJSONSchema(generatedContentSchema, { target: "draft-7" });
  const titleInstruction = options.title ? `Use this workshop title exactly: ${options.title}\n\n` : "";
  const prompt = `${titleInstruction}Create the workshop glossary from these sources. Return one complete JSON object and no Markdown fences.\n\n${source.content}`;

  return withPiRpc({
    cwd: process.cwd(),
    model: options.model,
    systemPrompt: `${systemPrompt(source)}\n\nJSON schema:\n${JSON.stringify(schema)}`,
  }, async (session) => {
    const first = await session.prompt(prompt);
    try {
      return parseGeneratedContent(first);
    } catch (error) {
      const detail = (error instanceof Error ? error.message : String(error)).slice(0, 4_000);
      console.warn("Pi returned invalid glossary JSON; requesting one repair.");
      const repaired = await session.prompt(`Your previous response did not pass the required JSON schema. Fix the complete response and return only the corrected JSON object.\n\nValidation error:\n${detail}`);
      try {
        return parseGeneratedContent(repaired);
      } catch (repairError) {
        const repairDetail = repairError instanceof Error ? repairError.message : String(repairError);
        throw new Error(`Pi could not produce a valid glossary after one repair: ${repairDetail}`);
      }
    }
  });
}

export function validateSourceReferences(generated: GeneratedContent, source: CollectedSource): void {
  const sourcePaths = new Set(source.files);
  const errors: string[] = [];
  const terms = generated.sections.flatMap((section) => section.terms);

  for (const item of [...terms, ...generated.resources]) {
    if (!sourcePaths.has(item.sourcePath)) {
      errors.push(`"${item.id}" references unknown source "${item.sourcePath}".`);
    }
  }
  for (const term of terms) {
    if (term.slide === null) continue;
    if (!source.slideSourcePath || term.sourcePath !== source.slideSourcePath) {
      errors.push(`"${term.id}" has a slide number, but "${term.sourcePath}" is not the resolved slide source.`);
    } else if (source.slideCount !== null && term.slide > source.slideCount) {
      errors.push(`"${term.id}" references slide ${term.slide}, but the source has ${source.slideCount} slide(s).`);
    }
  }
  if (errors.length) throw new Error(`Generated source references are invalid:\n${errors.join("\n")}`);
}

export function addCoreGlossary(generated: GeneratedContent): GeneratedContent {
  const duplicate = generated.sections.flatMap((section) => section.terms).find((term) => CORE_TERM_IDS.has(term.id));
  if (duplicate) throw new Error(`Generated term "${duplicate.id}" duplicates a built-in AI basics term.`);
  if (generated.sections.some((section) => section.id === CORE_GLOSSARY_SECTION.id)) {
    throw new Error(`Generated section "${CORE_GLOSSARY_SECTION.id}" is reserved for built-in terms.`);
  }
  return { ...generated, sections: [CORE_GLOSSARY_SECTION, ...generated.sections] };
}

async function writeAtomic(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temp = `${path}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temp, path);
}

export async function main(argv = process.argv.slice(2)): Promise<void> {
  const options = parseArgs(argv);
  const source = await collectWorkshopSource(options.input, options.includes);
  console.log(`Reading ${source.files.length} source file${source.files.length === 1 ? "" : "s"}.`);
  console.log(`Generating through Pi${options.model ? ` with ${options.model}` : " using its configured default model"}.`);

  const generated = await requestGlossary(options, source);
  validateSourceReferences(generated, source);
  const withCore = addCoreGlossary(generated);
  const workshop = workshopGlossarySchema.parse({
    ...withCore,
    event: options.event ?? withCore.event,
    credit: options.credit ?? withCore.credit,
    schemaVersion: 1,
    slug: options.slug,
    updated: new Date().toISOString().slice(0, 10),
    slidesUrl: options.slidesUrl.replace(/\/$/, ""),
    theme: { preset: options.themePreset, accent: options.accent },
  });
  await writeAtomic(options.out, workshop);

  const termCount = workshop.sections.reduce((total, section) => total + section.terms.length, 0);
  console.log(`Wrote ${termCount} terms, ${workshop.quiz.length} questions, and ${workshop.resources.length} resources to ${options.out}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}

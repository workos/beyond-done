import assert from "node:assert/strict";
import { chmod, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { workshopGlossarySchema, type WorkshopGlossary } from "../src/schema.js";
import { addCoreGlossary, main, parseGeneratedContent, validateSourceReferences } from "./generate.js";
import { collectSource, collectWorkshopSource } from "./source.js";

const validWorkshop: WorkshopGlossary = {
  schemaVersion: 1,
  slug: "agent-workshop",
  title: "Agent workshop",
  subtitle: "The working vocabulary",
  event: "",
  credit: "",
  updated: "2026-09-15",
  slidesUrl: "/slides",
  theme: { preset: "paper", accent: "#b94724" },
  sections: [
    {
      id: "level-0",
      level: "Level 0",
      name: "Foundations",
      intro: "Start here.",
      difficulty: "easy",
      terms: [
        {
          id: "delegation",
          term: "Delegation",
          definition: "Handing a bounded task to an agent.",
          whyItMatters: "It explains how to assign multi-step work.",
          hear: "",
          aliases: [],
          relatedTermIds: [],
          demo: "agent-loop",
          sourcePath: "slides.md",
          slide: 2,
        },
      ],
    },
  ],
  resources: [],
  quiz: [
    {
      id: "delegation-check",
      question: "What makes delegation safe?",
      choices: ["Clear bounds", "A longer prompt", "A logo", "A larger screen"],
      answerIndex: 0,
      explanation: "A bounded task has a recognizable result.",
      termIds: ["delegation"],
    },
  ],
};

test("validates cross-references", () => {
  assert.equal(workshopGlossarySchema.safeParse(validWorkshop).success, true);
  const invalid = structuredClone(validWorkshop);
  invalid.sections[0].terms[0].relatedTermIds = ["missing"];
  const result = workshopGlossarySchema.safeParse(invalid);
  assert.equal(result.success, false);
  assert.match(result.error?.message ?? "", /unknown term/);
});

test("annotates slides for one markdown file", async () => {
  const dir = await mkdtemp(join(tmpdir(), "workshop-glossary-"));
  const file = join(dir, "slides.md");
  await writeFile(file, "---\ntitle: Demo\n---\n# One\n---\n# Two\n", "utf8");
  const source = await collectSource(file);
  assert.equal(source.hasReliableSlideNumbers, true);
  assert.equal(source.slideSourcePath, "slides.md");
  assert.equal(source.slideCount, 2);
  assert.match(source.content, /\[SLIDE 1\]/);
  assert.match(source.content, /\[SLIDE 2\]/);
});

test("rejects invented source paths and unreliable slide links", () => {
  const generated = structuredClone(validWorkshop);
  assert.throws(
    () => validateSourceReferences(generated, {
      inputPath: "/workshop",
      files: ["slides.md"],
      content: "",
      hasReliableSlideNumbers: false,
      slideSourcePath: null,
      slideCount: null,
    }),
    /is not the resolved slide source/,
  );

  generated.sections[0].terms[0].slide = null;
  generated.sections[0].terms[0].sourcePath = "invented.md";
  assert.throws(
    () => validateSourceReferences(generated, {
      inputPath: "/workshop",
      files: ["slides.md"],
      content: "",
      hasReliableSlideNumbers: false,
      slideSourcePath: null,
      slideCount: null,
    }),
    /unknown source/,
  );
});

test("adds the built-in AI basics and rejects generated duplicates", () => {
  const { schemaVersion: _schemaVersion, slug: _slug, updated: _updated, slidesUrl: _slidesUrl, theme: _theme, ...generated } = validWorkshop;
  const withCore = addCoreGlossary(generated);
  assert.equal(withCore.sections[0].id, "ai-basics");
  assert.ok(withCore.sections[0].terms.some((term) => term.id === "agent"));
  assert.equal(workshopGlossarySchema.safeParse({ ...validWorkshop, ...withCore }).success, true);

  const duplicate = structuredClone(generated);
  duplicate.sections[0].terms[0].id = "agent";
  assert.throws(() => addCoreGlossary(duplicate), /duplicates a built-in/);
});

test("keeps resolved slide numbers when optional materials are included", async () => {
  const dir = await mkdtemp(join(tmpdir(), "workshop-glossary-materials-"));
  const slides = join(dir, "slides.md");
  const materials = join(dir, "materials");
  await mkdir(materials);
  await writeFile(slides, "# One\n---\n# Two\n", "utf8");
  await writeFile(join(materials, "handout.md"), "# Handout", "utf8");
  const source = await collectWorkshopSource(slides, [materials]);
  assert.equal(source.slideSourcePath, "slides.md");
  assert.deepEqual(source.files, ["slides.md", "materials/handout.md"]);
  assert.match(source.content, /SOURCE: materials\/handout.md/);
});

test("parses JSON from a fenced Pi response", () => {
  const { schemaVersion: _schemaVersion, slug: _slug, updated: _updated, slidesUrl: _slidesUrl, theme: _theme, ...generated } = validWorkshop;
  const parsed = parseGeneratedContent(`\n\`\`\`json\n${JSON.stringify(generated)}\n\`\`\`\n`);
  assert.equal(parsed.title, validWorkshop.title);
});

test("generates through Pi RPC and repairs invalid JSON", async () => {
  const dir = await mkdtemp(join(tmpdir(), "workshop-glossary-pi-rpc-"));
  const slides = join(dir, "slides.md");
  const output = join(dir, "generated", "glossary.json");
  const promptLog = join(dir, "prompts.log");
  const fakePi = join(dir, "fake-pi.mjs");
  const { schemaVersion: _schemaVersion, slug: _slug, updated: _updated, slidesUrl: _slidesUrl, theme: _theme, ...generated } = validWorkshop;

  await writeFile(slides, "# One\n---\n# Two\n", "utf8");
  await writeFile(fakePi, `#!/usr/bin/env node
import { appendFileSync } from "node:fs";
const requiredArgs = ["--mode", "rpc", "--no-session", "--no-tools", "--no-extensions", "--no-context-files", "--no-approve", "--model", "fake/model"];
if (!requiredArgs.every(value => process.argv.includes(value))) process.exit(2);
let buffer = "", prompts = 0, last = "";
const valid = ${JSON.stringify(JSON.stringify(generated))};
const send = value => process.stdout.write(JSON.stringify(value) + "\\n");
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => {
  buffer += chunk;
  let newline;
  while ((newline = buffer.indexOf("\\n")) !== -1) {
    const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 1);
    if (!line) continue;
    const command = JSON.parse(line);
    if (command.type === "prompt") {
      prompts += 1;
      appendFileSync(${JSON.stringify(promptLog)}, "prompt\\n");
      last = prompts === 1 ? "not json" : valid;
      send({ id: command.id, type: "response", command: "prompt", success: true });
      send({ type: "agent_settled" });
    } else if (command.type === "get_last_assistant_text") {
      send({ id: command.id, type: "response", command: command.type, success: true, data: { text: last } });
    }
  }
});
`, "utf8");
  await chmod(fakePi, 0o755);

  const previousCommand = process.env.PI_COMMAND;
  process.env.PI_COMMAND = fakePi;
  try {
    await main([slides, "--out", output, "--slug", "agent-workshop", "--model", "fake/model"]);
  } finally {
    if (previousCommand === undefined) delete process.env.PI_COMMAND;
    else process.env.PI_COMMAND = previousCommand;
  }

  const workshop = workshopGlossarySchema.parse(JSON.parse(await readFile(output, "utf8")));
  assert.equal(workshop.sections[0].id, "ai-basics");
  assert.equal((await readFile(promptLog, "utf8")).trim().split("\n").length, 2);
});

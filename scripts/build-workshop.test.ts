import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Glossary } from "../src/App.js";
import type { WorkshopGlossary } from "../src/schema.js";

const exec = promisify(execFile);

test("no-slides build hides slide links, filenames, and local-only resources without changing the source",  async () => {
  const directory = await mkdtemp(join(tmpdir(), "companion-build-"));
  const source = join(directory, "glossary.json");
  const output = join(directory, "dist");
  const workshop: WorkshopGlossary = {
    schemaVersion: 1,
    slug: "test-workshop",
    title: "Test workshop",
    subtitle: "Build test",
    event: "",
    credit: "",
    updated: "2026-09-15",
    slidesUrl: "https://example.com/slides",
    theme: { preset: "paper", accent: "#b94724" },
    sections: [{
      id: "basics", level: "Level 0", name: "Basics", intro: "Start here.", difficulty: "easy",
      terms: [{
        id: "prompt", term: "Prompt", definition: "Input to a model.", whyItMatters: "Directs the response.",
        hear: "", aliases: [], relatedTermIds: [], demo: "none", sourcePath: "slides.md", slide: 2,
      }],
    }],
    resources: [
      { id: "outline", title: "slides.md", description: "Workshop outline.", url: "", sourcePath: "slides.md", termIds: ["prompt"] },
      { id: "guide", title: "Prompt guide", description: "More about prompts.", url: "https://example.org/prompts", sourcePath: "slides.md", termIds: ["prompt"] },
      { id: "deck", title: "Workshop slides", description: "The slide deck.", url: "https://example.com/slides/2/", sourcePath: "slides.md", termIds: ["prompt"] },
    ],
    quiz: [{
      id: "prompt-check", question: "What is a prompt?", choices: ["Input", "Output", "Model", "Tool"],
      answerIndex: 0, explanation: "A prompt is input.", termIds: ["prompt"],
    }],
  };
  const original = JSON.stringify(workshop);
  try {
    await writeFile(source, original);
    for (const noSlides of [true, false]) {
      await exec(process.execPath, [
        "--import", "tsx", resolve("scripts/build-workshop.ts"), source, "--out", output,
        ...(noSlides ? ["--no-slides"] : []),
      ]);
      const built = JSON.parse(await readFile(join(output, "glossary.json"), "utf8"));
      const html = renderToStaticMarkup(createElement(Glossary, { workshop: built }));
      if (noSlides) {
        assert.doesNotMatch(html, /slides\.md|Source:|slide 2|example\.com\/slides|Workshop slides/);
        assert.match(html, /Prompt guide/);
      } else {
        assert.match(html, /slides\.md/);
        assert.match(html, /Source:/);
        assert.match(html, /example\.com\/slides\/2\//);
      }
      assert.deepEqual(built, {
        ...workshop,
        slidesUrl: noSlides ? "" : workshop.slidesUrl,
        resources: noSlides ? [workshop.resources[1]] : workshop.resources,
      });
      assert.match(await readFile(join(output, "index.html"), "utf8"), /assets\//);
      assert.equal(await readFile(source, "utf8"), original);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

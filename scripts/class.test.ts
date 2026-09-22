import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Glossary } from "../src/App.js";
import { classConfig, classConfigSchema, cloudflareConfig } from "../src/class-config.js";
import { prepareClassGlossary, starterGlossary } from "../src/class-glossary.js";
import worker, { type Env } from "../src/worker.js";
import { generationArgs } from "./class.js";
import { collectWorkshopSource } from "./source.js";

const exec = promisify(execFile);
const disabled = { quiz: false, demos: false, progress: false, chat: false };
const enabled = { quiz: true, demos: true, progress: true, chat: true };

function glossary() {
  const input = starterGlossary(classConfig);
  input.sections = structuredClone(input.sections);
  input.slidesUrl = "https://previous.example/slides";
  input.sections[0].terms[0].slide = 2;
  input.sections[0].terms[0].sourcePath = "private-deck.md";
  input.resources = [
    { id: "deck", title: "Deck", description: "Slides", url: "https://previous.example/slides?download=1", sourcePath: "private-deck.md", termIds: [] },
    { id: "local", title: "Source", description: "Local source", url: "", sourcePath: "private-deck.md", termIds: [] },
    { id: "slides", title: "Slide", description: "A slide", url: "/slides/#/2", sourcePath: "private-deck.md", termIds: [] },
    { id: "guide", title: "Guide", description: "A public guide", url: "https://example.org/guide", sourcePath: "private-deck.md", termIds: [] },
  ];
  return input;
}

test("class config validates the hostname and generates explicit Cloudflare routes", () => {
  for (const hostname of ["https://class.typevoid.com", "typevoid.com", "class.example.com", "class.typevoid.com/path", "-class.typevoid.com"]) {
    assert.equal(classConfigSchema.safeParse({ ...classConfig, hostname }).success, false);
  }
  const config = cloudflareConfig({ ...classConfig, hostname: "agents.typevoid.com", slug: "agents", features: disabled });
  assert.equal(config.name, "agents");
  assert.deepEqual(config.routes, [{ pattern: "agents.typevoid.com", custom_domain: true }]);
  assert.equal(config.vars.CHAT_ENABLED, "false");
  assert.equal(config.assets.not_found_handling, "404-page");
  assert.equal(config.workers_dev, false);
});

test("class audience and links are optional and link URLs are safe", () => {
  const legacy = classConfigSchema.parse({ ...classConfig, audience: undefined, links: undefined });
  assert.equal(legacy.audience, "");
  assert.deepEqual(legacy.links, []);
  for (const url of ["https://example.com/resources", "http://localhost:4321/", "mailto:teacher@example.com", "/handout.pdf", "/#lessons-heading", "#content"]) {
    const parsed = classConfigSchema.parse({ ...classConfig, audience: "  New developers  ", links: [{ label: " Resources ", url }] });
    assert.equal(parsed.audience, "New developers");
    assert.deepEqual(parsed.links, [{ label: "Resources", url }]);
  }
  for (const url of ["javascript:alert(1)", "data:text/html,test", "//example.com", "/\\\\example.com", "not a URL", "", "/bad path"]) {
    assert.equal(classConfigSchema.safeParse({ ...classConfig, links: [{ label: "Resources", url }] }).success, false, url);
  }
  assert.equal(classConfigSchema.safeParse({ ...classConfig, links: [{ label: "  ", url: "https://example.com" }] }).success, false);
});

test("unpublished slides lose links and source metadata without changing reviewed data", () => {
  const input = glossary();
  const original = structuredClone(input);
  const prepared = prepareClassGlossary(input, { ...classConfig, slides: { publish: false, link: true }, features: disabled });
  assert.equal(prepared.slidesUrl, "");
  assert.deepEqual(prepared.resources.map(resource => resource.id), ["guide"]);
  assert.ok(prepared.sections.flatMap(section => section.terms).every(term => term.slide === null && term.demo === "none"));
  assert.doesNotMatch(JSON.stringify(prepared), /private-deck|previous\.example/);
  assert.deepEqual(input, original);
  const published = prepareClassGlossary(input, { ...classConfig, slides: { publish: true, link: true }, features: enabled });
  assert.equal(published.slidesUrl, "/slides/#");
  assert.equal(published.sections[0].terms[0].slide, 2);
});

test("published slides can be unlinked without disabling publication", () => {
  const config = classConfigSchema.parse({ ...classConfig, slides: { publish: true, link: false } });
  assert.equal(config.slides.publish, true);
  const prepared = prepareClassGlossary(glossary(), config);
  assert.equal(prepared.slidesUrl, "");
  assert.deepEqual(prepared.resources.map(resource => resource.id), ["guide"]);
  assert.ok(prepared.sections.flatMap(section => section.terms).every(term => term.slide === null));
  assert.equal(classConfigSchema.parse({ ...classConfig, slides: { publish: true } }).slides.link, true);
});

test("optional companion features are absent when disabled and present when enabled", () => {
  const workshop = starterGlossary(classConfig);
  const off = renderToStaticMarkup(createElement(Glossary, { workshop, features: disabled, embedded: true }));
  assert.doesNotMatch(off, /id="quiz"|href="#quiz"|Mark learned|chat-fab|class="demo|class="reading-progress"/);
  const on = renderToStaticMarkup(createElement(Glossary, { workshop, features: enabled }));
  assert.doesNotMatch(on, /chat-fab/, "chat stays hidden until runtime availability is confirmed");
  for (const expected of [/id="quiz"/, /Mark learned/, /class="demo/, /class="reading-progress"/]) assert.match(on, expected);
});

test("chat availability requires both an enabled feature and a configured key", async () => {
  for (const [enabled, key, expected] of [["true", "", false], ["true", "configured", true], ["false", "configured", false]] as const) {
    const response = await worker.fetch(new Request("https://class.typevoid.com/api/chat/status"), {
      CHAT_ENABLED: enabled, OPENROUTER_API_KEY: key,
    } as Env);
    assert.deepEqual(await response.json(), { enabled: expected });
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
});

test("disabled chat blocks the server endpoint even if credentials exist", async () => {
  let fetched = false;
  const env = {
    CHAT_ENABLED: "false", OPENROUTER_API_KEY: "not-used",
    ASSETS: { fetch: async () => { fetched = true; return new Response("asset"); } },
  } as unknown as Env;
  const response = await worker.fetch(new Request("https://class.typevoid.com/api/chat", { method: "POST", body: "{}" }), env);
  assert.equal(response.status, 404);
  assert.equal(fetched, false);
  assert.equal((await worker.fetch(new Request("https://class.typevoid.com/"), env)).status, 200);
  assert.equal(fetched, true);
});

test("generation uses lessons and resolved Slidev sources regardless of publishing", async () => {
  assert.deepEqual(generationArgs({ ...classConfig, slides: { publish: false, link: false } }), generationArgs({ ...classConfig, slides: { publish: true, link: true } }));
  const args = generationArgs({ ...classConfig, event: "", credit: "" });
  assert.ok(args.includes("src/content/lessons"));
  assert.ok(!args.includes("--event"));
  const directory = await mkdtemp(join(tmpdir(), "class-source-"));
  try {
    await mkdir(join(directory, "lessons"));
    await writeFile(join(directory, "slides.md"), "---\ntitle: Class\n---\n# First\n\n---\nlayout: center\n---\n# Second\n\n---\nsrc: ./extra.md\n---\n");
    await writeFile(join(directory, "extra.md"), "# Imported\n\n---\nhide: true\n---\n# Hidden\n");
    await writeFile(join(directory, "lessons", "lesson.mdx"), "---\ntitle: Lesson\n---\n# Lesson content");
    const source = await collectWorkshopSource(join(directory, "slides.md"), [join(directory, "lessons")]);
    assert.equal(source.slideCount, 3);
    assert.match(source.content, /\[SLIDE 3\]\n# Imported/);
    assert.doesNotMatch(source.content, /# Hidden/);
    assert.match(source.content, /SOURCE: lessons\/lesson.mdx/);
    assert.match(source.content, /# Lesson content/);
    assert.equal((source.content.match(/\[SLIDE /g) ?? []).length, 3);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("class builds publish slides only when enabled and never overwrite the glossary", { timeout: 180_000 }, async () => {
  const directory = await mkdtemp(join(tmpdir(), "class-build-"));
  try {
    for (const path of ["src", "scripts", "slides", "astro.config.mjs", "class.config.json", "tsconfig.json", "package.json"]) {
      await cp(resolve(path), join(directory, path), { recursive: true });
    }
    await symlink(resolve("node_modules"), join(directory, "node_modules"), "dir");
    await mkdir(join(directory, "generated"));
    const original = JSON.stringify(glossary());
    await writeFile(join(directory, "generated/glossary.json"), original);
    await writeFile(join(directory, "slides/slides.md"), "---\ntheme: default\n---\n# DECK_ONLY_SENTINEL\n\n<!-- PRIVATE_SPEAKER_NOTE -->\n\n---\n# Second slide\n");
    // Build enabled first so the disabled rebuild must remove stale deck assets.
    for (const [publish, link] of [[true, true], [true, false], [false, true]]) {
      await writeFile(join(directory, "class.config.json"), JSON.stringify({
        ...classConfig, title: "Configured class", credit: "Workshop instructor",
        audience: publish ? "Developers <new> to the topic" : "",
        links: publish ? [{ label: "Resources & help", url: "https://example.org/resources" }] : [],
        slides: { publish, link }, features: publish ? enabled : disabled,
      }));
      await exec(process.execPath, ["--import", "tsx", "scripts/class.ts", "build"], { cwd: directory, maxBuffer: 4_000_000 });
      const home = await readFile(join(directory, "dist/index.html"), "utf8");
      assert.match(home, /Start here/);
      assert.match(home, /Ground an answer/);
      assert.match(home, /<h1>Configured class<\/h1>/);
      assert.match(home, /Workshop instructor/);
      assert.equal(home.includes("Developers &lt;new&gt; to the topic"), publish);
      assert.equal(home.includes('class="class-audience"'), publish);
      assert.equal(home.includes('href="/slides/"'), publish && link);
      const lesson = await readFile(join(directory, "dist/lessons/02-ground-an-answer/index.html"), "utf8");
      assert.match(lesson, /Try a missing detail/);
      const glossaryPage = await readFile(join(directory, "dist/glossary/index.html"), "utf8");
      for (const page of [home, lesson, glossaryPage]) {
        assert.equal(page.includes('aria-label="Class links"'), publish);
        assert.equal(page.includes('href="https://example.org/resources"'), publish);
        assert.equal(page.includes("Resources &amp; help"), publish);
      }
      assert.equal(lesson.includes('class="pill lesson-complete"'), publish);
      const built = await readFile(join(directory, "dist/glossary.json"), "utf8");
      if (publish) {
        assert.match(await readFile(join(directory, "dist/slides/index.html"), "utf8"), /\/slides\//);
        if (link) assert.match(built, /\/slides\/#/);
        else assert.doesNotMatch(built, /\/slides|private-deck|previous\.example/);
      } else {
        await assert.rejects(readFile(join(directory, "dist/slides/index.html")), { code: "ENOENT" });
        assert.doesNotMatch(built, /private-deck|previous\.example/);
      }
      const outputFiles = (await readdir(join(directory, "dist"), { recursive: true })).filter(path => /\.(?:html|js|json|md)$/.test(path));
      const output = (await Promise.all(outputFiles.map(path => readFile(join(directory, "dist", path), "utf8")))).join("\n");
      assert.doesNotMatch(output, /PRIVATE_SPEAKER_NOTE/);
      if (!publish) assert.doesNotMatch(output, /DECK_ONLY_SENTINEL|private-deck/);
      assert.equal(await readFile(join(directory, "generated/glossary.json"), "utf8"), original);
      const cloudflare = JSON.parse(await readFile(join(directory, ".class-build/wrangler.json"), "utf8"));
      assert.equal(cloudflare.vars.CHAT_ENABLED, String(publish));
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { workshopGlossarySchema } from "../src/schema.js";
import { hash } from "./types.js";

test("six timed lessons sum to 60 minutes, with preflight explicitly excluded", async () => {
  const root = new URL("../src/content/lessons/", import.meta.url);
  const files = await readdir(root);
  const lessons = await Promise.all(files.map(file => readFile(new URL(file, root), "utf8")));
  assert.equal(lessons.length, 7);
  const prework = lessons.filter(text => /^prework: true$/m.test(text));
  assert.equal(prework.length, 1);
  const live = lessons.filter(text => !prework.includes(text));
  assert.equal(live.reduce((sum, text) => {
    const duration = /^duration: "(\d+) minutes/m.exec(text);
    assert.ok(duration, "Timed lessons declare minutes");
    return sum + Number(duration[1]);
  }, 0), 60);
});
test("both instructors are credited and the game has editable participant candidates", async () => {
  const root = new URL("../", import.meta.url);
  for (const path of ["class.config.json", "generated/glossary.json"]) {
    const config = JSON.parse(await readFile(new URL(path, root), "utf8"));
    assert.equal(config.credit, "Nick Nisi & Zack Proser");
  }
  const deck = await readFile(new URL("slides/slides.md", root), "utf8");
  assert.match(deck, /people\/nick-nisi.webp/);
  assert.match(deck, /people\/zack-proser.jpg/);
  const lesson = await readFile(new URL("src/content/lessons/06-red-team.md", root), "utf8");
  assert.match(lesson, /--candidate lab\/challenges\/bluff.json/);
  assert.match(lesson, /--candidate lab\/challenges\/legit.json/);
});
test("reviewed glossary has valid links between terms and six workshop questions", async () => {
  const glossary = workshopGlossarySchema.parse(JSON.parse(await readFile(new URL("../generated/glossary.json", import.meta.url), "utf8")));
  assert.equal(glossary.sections.flatMap(section => section.terms).length, 18);
  assert.equal(glossary.quiz.length, 6);
});
test("recorded examples preserve exact question hashes, inputs, and source labels", async () => {
  const recording = JSON.parse(await readFile(new URL("../public/materials/jev-recording.json", import.meta.url), "utf8"));
  assert.match(recording.kind, /Recorded live/);
  assert.equal(recording.captures.length, 3);
  for (const capture of recording.captures) {
    assert.equal(capture.questionHash, hash(capture.questions));
    assert.equal(capture.response.model, "jev-1.13.0");
    assert.ok(capture.state.evidence.confirmationBeforeReload);
    assert.equal(typeof capture.response.answers.honest.noul, "number");
  }
});

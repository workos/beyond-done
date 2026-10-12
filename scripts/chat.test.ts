import assert from "node:assert/strict";
import test from "node:test";
import { ChatError, validateMessages } from "../src/openrouter.js";

test("rejects oversized chat messages", () => {
  assert.throws(
    () => validateMessages([{ role: "user", content: "x".repeat(2_001) }]),
    (error) => error instanceof ChatError && error.status === 400,
  );
});

test("keeps valid user and assistant messages", () => {
  assert.deepEqual(validateMessages([
    { role: "user", content: "What is an agent?" },
    { role: "assistant", content: "A model working through tools." },
  ]), [
    { role: "user", content: "What is an agent?" },
    { role: "assistant", content: "A model working through tools." },
  ]);
});

test("the class system prompt grounds answers in the glossary and lessons", async () => {
  const { classSystemPrompt } = await import("./dev-chat.js");
  const prompt = await classSystemPrompt();
  assert.match(prompt, /Answer from the glossary and lessons below/);
  assert.match(prompt, /- Bounded repair:/);
  assert.match(prompt, /===== SOURCE: 03-drive-the-app\.md =====/);
});

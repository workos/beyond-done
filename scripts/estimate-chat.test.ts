import assert from "node:assert/strict";
import test from "node:test";
import type { WorkshopGlossary } from "../src/schema.js";
import { estimateChatUsage } from "./estimate-chat.js";

const workshop: WorkshopGlossary = {
  schemaVersion: 1,
  slug: "test-workshop",
  title: "Test workshop",
  subtitle: "Test",
  event: "",
  credit: "",
  updated: "2026-09-16",
  slidesUrl: "",
  theme: { preset: "paper", accent: "#b94724" },
  sections: [{
    id: "level-0",
    level: "Level 0",
    name: "Foundations",
    intro: "Start here.",
    difficulty: "easy",
    terms: [{
      id: "agent",
      term: "Agent",
      definition: "A model using tools in a loop.",
      whyItMatters: "It can complete multi-step work.",
      hear: "",
      aliases: [],
      relatedTermIds: [],
      demo: "agent-loop",
      sourcePath: "slides.md",
      slide: null,
    }],
  }],
  resources: [],
  quiz: [{
    id: "agent-check",
    question: "What is an agent?",
    choices: ["A", "B", "C", "D"],
    answerIndex: 0,
    explanation: "A",
    termIds: ["agent"],
  }],
};

test("estimates answers from current model prices and workshop prompt size", () => {
  const estimate = estimateChatUsage({
    workshop,
    budgetUsd: 15,
    attendees: 30,
    questionsPerAttendee: 5,
    buffer: 0.5,
    promptPricePerToken: 0.000001,
    completionPricePerToken: 0.000005,
  });
  assert.equal(estimate.maxOutputTokens, 500);
  assert.ok(estimate.answers > 1_000);
  assert.equal(estimate.answersPerAttendee, estimate.answers / 30);
  assert.equal(estimate.tokensPerAttendee, (estimate.estimatedInputTokens + 500) * 5);
  assert.ok(estimate.recommendedBudget >= 15);
});
